from sqlalchemy import func
import os, uuid, base64, json, calendar, re
from datetime import datetime, timedelta, date
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Date,
    Float,
    ForeignKey,
    Text,
    Boolean,
    text,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel

BASE = os.path.dirname(__file__)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DB = DATABASE_URL
else:
    DB = "sqlite:///" + os.path.join(BASE, "dante.db")

if DB.startswith("postgres://"):
    DB = DB.replace("postgres://", "postgresql+psycopg://", 1)
elif DB.startswith("postgresql://"):
    DB = DB.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    DB,
    connect_args={"check_same_thread": False}
    if DB.startswith("sqlite")
    else {},
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
pwd = CryptContext(schemes=["bcrypt"])
oauth = OAuth2PasswordBearer(tokenUrl="/api/login")
SECRET = os.getenv("SECRET_KEY", "change-this-in-production")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    role = Column(String)
    professor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    active = Column(Boolean, default=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    contact_pending = Column(Boolean, default=False)
    theme_color = Column(String, nullable=True)
    brand_logo = Column(Text, nullable=True)


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_name = Column(String, default="")
    weekday = Column(Integer)
    time = Column(String)
    note = Column(String, default="")
    scheduled_date = Column(Date, nullable=True)
    status = Column(String, default="pending")
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)


class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    professor_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(Text)
    periodization = Column(String, default="")
    updated_at = Column(DateTime, default=datetime.utcnow)


class Completion(Base):
    __tablename__ = "completions"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    completed_at = Column(DateTime, default=datetime.utcnow)


class Weight(Base):
    __tablename__ = "weights"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    value = Column(Float)
    measured_on = Column(Date, default=date.today)


class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class PaymentPlan(Base):
    __tablename__ = "payment_plans"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), unique=True)
    professor_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    cycle = Column(String)
    amount = Column(Float, nullable=True)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("payment_plans.id"))
    due_date = Column(Date)
    paid = Column(Boolean, default=False)
    paid_at = Column(DateTime, nullable=True)

class WorkoutSet(Base):
    __tablename__ = "workout_sets"
    id = Column(Integer, primary_key=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    exercise_key = Column(String)
    exercise_name = Column(String)
    set_number = Column(Integer)
    load_kg = Column(Float)
    load_unit = Column(String, default="kg", nullable=False)
    reps = Column(Integer, nullable=True)
    session_key = Column(String, nullable=True)
    performed_at = Column(DateTime, default=datetime.utcnow)

class WorkoutNotification(Base):
    __tablename__ = "workout_notifications"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)

Base.metadata.create_all(engine)
from sqlalchemy import inspect, text as sql_text
with engine.begin() as conn:
    cols = {c["name"] for c in inspect(conn).get_columns("users")}
    for col, kind in (("theme_color", "VARCHAR"), ("brand_logo", "TEXT")):
        if col not in cols: conn.execute(sql_text(f"ALTER TABLE users ADD COLUMN {col} {kind}"))

# Migração idempotente para bancos já existentes.
with engine.begin() as conn:
    if DB.startswith("sqlite"):
        lesson_columns = {row[1] for row in conn.execute(text("PRAGMA table_info(lessons)"))}
    else:
        lesson_columns = {row[0] for row in conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons'"
        ))}
    for col, definition in {"scheduled_date":"DATE", "status":"VARCHAR DEFAULT 'pending'", "completed_at":"DATETIME", "cancelled_at":"DATETIME"}.items():
        if col not in lesson_columns:
            conn.execute(text(f"ALTER TABLE lessons ADD COLUMN {col} {definition}"))
    if "student_name" not in lesson_columns:
        conn.execute(text("ALTER TABLE lessons ADD COLUMN student_name VARCHAR DEFAULT ''"))

with engine.begin() as conn:
    if DB.startswith("sqlite"):
        user_columns = {r[1] for r in conn.execute(text("PRAGMA table_info(users)"))}
    else:
        user_columns = {r[0] for r in conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users'"))}
    for column, sqltype in {"email":"VARCHAR", "phone":"VARCHAR", "contact_pending":"BOOLEAN DEFAULT FALSE"}.items():
        if column not in user_columns:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {column} {sqltype}"))

with engine.begin() as conn:
    if "reps" not in {c["name"] for c in inspect(conn).get_columns("workout_sets")}:
        conn.execute(text("ALTER TABLE workout_sets ADD COLUMN reps INTEGER"))

with engine.begin() as conn:
    if "session_key" not in {c["name"] for c in inspect(conn).get_columns("workout_sets")}:
        conn.execute(text("ALTER TABLE workout_sets ADD COLUMN session_key VARCHAR"))

with engine.begin() as conn:
    if "load_unit" not in {c["name"] for c in inspect(conn).get_columns("workout_sets")}:
        conn.execute(text("ALTER TABLE workout_sets ADD COLUMN load_unit VARCHAR NOT NULL DEFAULT 'kg'"))

app = FastAPI(title="App de Treinos API")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

def db():
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()


def token(u):
    return jwt.encode(
        {
            "sub": str(u.id),
            "role": u.role,
            "exp": datetime.utcnow() + timedelta(days=3650),
        },
        SECRET,
        algorithm="HS256",
    )


def me(t=Depends(oauth), s: Session = Depends(db)):
    try:
        uid = int(jwt.decode(t, SECRET, algorithms=["HS256"])["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(401, "Sessão inválida")
    u = s.get(User, uid)
    if not u or not u.active:
        raise HTTPException(401, "Usuário inválido")
    return u


def allow_prof(u):
    if u.role not in ("professor", "admin"):
        raise HTTPException(403, "Acesso de professor necessário")


class StudentIn(BaseModel):
    name: str
    username: str


class FirstAccessIn(BaseModel):
    username: str
    activation_code: str
    password: str


class RegisterIn(BaseModel):
    name: str
    username: str
    password: str
    role: str
    invite_code: str
    professor_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class ResetPasswordIn(BaseModel):
    username: str
    invite_code: str
    new_password: str


class LessonIn(BaseModel):
    student_name: str
    weekday: int
    time: str
    note: str = ""


class WorkoutIn(BaseModel):
    student_id: int
    title: str
    content: str
    periodization: str = ""


class WeightIn(BaseModel):
    value: float
    measured_on: date = date.today()


INVITE_CODE = os.getenv("DANTE_INVITE_CODE", "DG5A1")


class BrandingIn(BaseModel):
    color: str = "#65f6d2"
    logo: str | None = None
    phone: str | None = None


@app.get("/api/branding")
def get_branding(u=Depends(me), s: Session = Depends(db)):
    owner = u if u.role != "student" else s.get(User, u.professor_id)
    return {"color": owner.theme_color or "#65f6d2", "logo": None, "professor": owner.name, "phone": owner.phone or ""} if owner else {"color":"#65f6d2","logo":None,"professor":"","phone":""}


@app.put("/api/branding")
def put_branding(x: BrandingIn, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    import re
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", x.color):
        raise HTTPException(422, "Cor inválida")
    if x.logo and (len(x.logo) > 1400000 or not re.match(r"^data:image/(png|jpeg|webp);base64,", x.logo)):
        raise HTTPException(422, "Imagem inválida")
    u.theme_color = x.color
    u.brand_logo = None
    if x.phone is not None: u.phone = x.phone
    s.commit()
    return {"ok":True}


@app.get("/api/public/professors")
def public_professors(s: Session = Depends(db)):
    return [
        {"id": x.id, "name": x.name}
        for x in s.query(User)
        .filter(User.role == "professor", User.active == True)
        .order_by(User.name)
        .all()
    ]


@app.post("/api/register")
def register(x: RegisterIn, s: Session = Depends(db)):
    code = x.invite_code.strip().upper()
    if len(code) != 5 or not code.isalnum() or code != INVITE_CODE.upper():
        raise HTTPException(403, "Código de acesso inválido")
    if x.role != "professor":
        raise HTTPException(403, "Somente professores podem criar conta")
    if not x.phone or not re.fullmatch(r"[0-9]{11}", x.phone.strip()):
        raise HTTPException(400, "Informe WhatsApp com DDD e 9 dígitos, sem espaços")
    username = x.username.strip().casefold()
    if len(x.password) < 5:
        raise HTTPException(400, "A senha deve ter pelo menos 5 caracteres")
    if s.query(User).filter(func.lower(User.username) == username).first():
        raise HTTPException(409, "Usuário já existe")
    professor_id = None
    u = User(
        name=x.name.strip(),
        username=username,
        password_hash=pwd.hash(x.password),
        role=x.role,
        professor_id=professor_id,
        email=x.email, phone=x.phone, contact_pending=(x.role=="student" and not bool(x.email and x.phone)),
    )
    s.add(u)
    s.commit()
    s.refresh(u)
    return {
        "access_token": token(u),
        "token_type": "bearer",
        "user": {"id": u.id, "name": u.name, "role": u.role},
    }


@app.post("/api/reset-password")
def reset_password(x: ResetPasswordIn, s: Session = Depends(db)):
    code = x.invite_code.strip().upper()
    if len(code) != 5 or not code.isalnum() or code != INVITE_CODE.upper():
        raise HTTPException(403, "Código Dante inválido")
    if len(x.new_password) < 5:
        raise HTTPException(400, "A nova senha deve ter pelo menos 5 caracteres")
    username = x.username.strip().casefold()
    u = s.query(User).filter(func.lower(User.username) == username, User.active == True).first()
    if not u:
        raise HTTPException(404, "Usuário não encontrado")
    if (u.password_hash or "").startswith("pending:"):
        raise HTTPException(403, "Use a opção Primeiro acesso")
    u.password_hash = pwd.hash(x.new_password)
    s.commit()
    return {"ok": True, "message": "Senha redefinida com sucesso"}


@app.post("/api/first-access")
def first_access(x: FirstAccessIn, s: Session = Depends(db)):
    if len(x.password) < 5 or len(x.password.encode()) > 72:
        raise HTTPException(400, "Senha deve ter entre 5 caracteres e 72 bytes")
    u = s.query(User).filter(func.lower(User.username) == x.username.strip().casefold(), User.role == "student", User.active == True).with_for_update().first()
    if not u:
        raise HTTPException(404, "Nome de usuário não existe. Consulte seu professor para verificar o nome de usuário.")
    if not (u.password_hash or "").startswith("pending:"):
        raise HTTPException(403, "Primeiro acesso já realizado. Entre com sua senha.")
    if x.activation_code.strip().upper() != "DG5A1":
        raise HTTPException(403, "Código de acesso incorreto")
    u.password_hash = pwd.hash(x.password)
    s.commit()
    return {"ok": True}


@app.post("/api/login")
def login(f: OAuth2PasswordRequestForm = Depends(), s: Session = Depends(db)):
    u = s.query(User).filter(func.lower(User.username) == f.username.strip().casefold()).first()
    if u and u.active and u.role == "student" and (u.password_hash or "").startswith("pending:"):
        raise HTTPException(403, "FIRST_ACCESS_REQUIRED")
    if not u or not u.active or not u.password_hash or u.password_hash.startswith("pending:") or not pwd.verify(f.password, u.password_hash):
        raise HTTPException(401, "Usuário ou senha inválidos")
    return {
        "access_token": token(u),
        "token_type": "bearer",
        "user": {"id": u.id, "name": u.name, "role": u.role},
    }


@app.get("/api/me")
def profile(u=Depends(me)):
    return {"id": u.id, "name": u.name, "username": u.username, "role": u.role, "email":u.email, "phone":u.phone, "contact_pending":bool(u.contact_pending)}


@app.get("/api/me/dashboard")
def student_dashboard(u=Depends(me), s: Session = Depends(db)):
    today = date.today()
    dates = [x.completed_at.date() for x in s.query(Completion).filter(Completion.student_id == u.id).all()]
    week_start = today - timedelta(days=today.weekday())
    loads = s.query(WorkoutSet).filter(WorkoutSet.student_id == u.id, WorkoutSet.session_key.is_(None)).order_by(WorkoutSet.performed_at.desc()).all()
    return {"week":sum(d >= week_start for d in dates), "month":sum(d.year == today.year and d.month == today.month for d in dates), "year":sum(d.year == today.year for d in dates), "loads":[{"load_kg":x.load_kg,"load_unit":x.load_unit,"reps":x.reps,"exercise_name":x.exercise_name,"performed_at":x.performed_at.isoformat()} for x in reversed(loads)]}

@app.get("/api/me/notifications")
def notifications(u=Depends(me), s: Session = Depends(db)):
    return [{"id":n.id,"message":n.message} for n in s.query(WorkoutNotification).filter_by(student_id=u.id,read=False).order_by(WorkoutNotification.id.desc()).limit(20).all()]

@app.post("/api/me/notifications/{nid}/read")
def mark_notification(nid:int,u=Depends(me),s:Session=Depends(db)):
    n=s.query(WorkoutNotification).filter_by(id=nid,student_id=u.id).first()
    if not n: raise HTTPException(404)
    n.read=True;s.commit();return {"ok":True}

@app.get("/api/students")
def students(u=Depends(me), s: Session = Depends(db)):
    if u.role == "student":
        return [{"id": u.id, "name": u.name}]
    q = s.query(User).filter(User.role == "student")
    q = q if u.role == "admin" else q.filter(User.professor_id == u.id)
    return [
        {
            "id": x.id,
            "name": x.name,
            "username": x.username,
            "professor_id": x.professor_id,
            "email": x.email,
            "phone": x.phone,
            "contact_pending": bool(x.contact_pending),
        }
        for x in q.all()
    ]


@app.post("/api/students")
def add_student(x: StudentIn, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    if not x.name.strip() or not x.username.strip():
        raise HTTPException(400, "Informe nome e usuário")
    if s.query(User).filter(func.lower(User.username) == x.username.strip().casefold()).first():
        raise HTTPException(409, "Usuário já existe")
    st = User(
        name=x.name.strip(),
        username=x.username.strip().casefold(),
        password_hash="pending:",
        role="student",
        professor_id=u.id,
        contact_pending=True,
    )
    s.add(st)
    s.commit()
    s.refresh(st)
    return {"id": st.id}


class StudentEdit(BaseModel):
    name: str
    username: str
    phone: Optional[str] = None

@app.put("/api/students/{sid}")
def edit_student(sid: int, x: StudentEdit, u=Depends(me), s: Session=Depends(db)):
    allow_prof(u)
    st = s.get(User, sid)
    if not st or st.role != "student" or st.professor_id != u.id:
        raise HTTPException(404, "Aluno não encontrado")
    name, username = x.name.strip(), x.username.strip().casefold()
    phone = (x.phone or "").strip()
    if not name or not username or (phone and not re.fullmatch(r"[0-9]{11}", phone)):
        raise HTTPException(400, "Dados inválidos")
    if s.query(User).filter(func.lower(User.username)==username, User.id!=sid).first():
        raise HTTPException(409, "Usuário já existe")
    st.name, st.username, st.phone = name, username, phone or None
    st.contact_pending = not bool(st.email and st.phone)
    s.commit()
    return {"ok": True}

class ContactUpdate(BaseModel):
    email: str
    phone: str

@app.put("/api/me/contact")
def update_my_contact(x: ContactUpdate, u=Depends(me), s: Session=Depends(db)):
    from pydantic import EmailStr
    import re
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", x.email.strip()):
        raise HTTPException(400, "E-mail inválido")
    digits=re.sub(r"\D", "", x.phone)
    if not 10 <= len(digits) <= 13:
        raise HTTPException(400, "Telefone inválido")
    u.email=x.email.strip(); u.phone=digits; u.contact_pending=False
    s.commit()
    return {"ok":True}

@app.delete("/api/students/{sid}")
def del_student(sid: int, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    st = s.get(User, sid)
    if not st or st.role != "student" or (u.role != "admin" and st.professor_id != u.id):
        raise HTTPException(404)
    workout_ids=s.query(Workout.id).filter_by(student_id=sid)
    for model in (Completion, WorkoutSet):
        s.query(model).filter((model.student_id==sid) | model.workout_id.in_(workout_ids)).delete(synchronize_session=False)
    s.query(Payment).filter(Payment.plan_id.in_(s.query(PaymentPlan.id).filter_by(student_id=sid))).delete(synchronize_session=False)
    for model in (PaymentPlan, Lesson, Photo, Weight, WorkoutNotification, Workout):
        s.query(model).filter_by(student_id=sid).delete(synchronize_session=False)
    s.delete(st)
    s.commit()
    return {"ok": True}


def lesson_out(x):
    return {"id":x.id,"student":x.student_name,"student_id":x.student_id,"scheduled_date":x.scheduled_date.isoformat() if x.scheduled_date else None,"weekday":x.weekday,"time":x.time,"status":x.status or "pending"}

@app.get("/api/lessons")
def lessons(u=Depends(me), s:Session=Depends(db)):
    q=s.query(Lesson).filter(Lesson.professor_id==u.id) if u.role=="professor" else s.query(Lesson).filter(Lesson.student_id==u.id)
    return [lesson_out(x) for x in q.order_by(Lesson.scheduled_date,Lesson.time).all()]

class DatedLessonIn(BaseModel):
    student_id:int
    scheduled_date:date
    time:str

@app.post("/api/lessons")
def add_lesson(x:DatedLessonIn,u=Depends(me),s:Session=Depends(db)):
    allow_prof(u)
    student=s.get(User,x.student_id)
    if not student or student.professor_id!=u.id: raise HTTPException(404,"Aluno não encontrado")
    a=Lesson(professor_id=u.id,student_id=student.id,student_name=student.name,scheduled_date=x.scheduled_date,weekday=x.scheduled_date.weekday(),time=x.time,status="pending")
    s.add(a);s.commit();return lesson_out(a)

@app.patch("/api/lessons/{lid}/status")
def lesson_status(lid:int,status:str,u=Depends(me),s:Session=Depends(db)):
    allow_prof(u)
    x=s.get(Lesson,lid)
    if not x or x.professor_id!=u.id:raise HTTPException(404)
    if status not in ("completed","cancelled","pending"):raise HTTPException(400,"Status inválido")
    x.status=status
    x.completed_at=datetime.utcnow() if status=="completed" else None
    x.cancelled_at=datetime.utcnow() if status=="cancelled" else None
    s.commit();return lesson_out(x)

@app.delete("/api/lessons/{lid}")
def delete_lesson(lid:int,u=Depends(me),s:Session=Depends(db)):
    allow_prof(u)
    x=s.get(Lesson,lid)
    if not x or x.professor_id!=u.id:raise HTTPException(404)
    s.delete(x);s.commit();return {"ok":True}

@app.get("/api/workouts")
def workouts(u=Depends(me), s: Session = Depends(db)):
    q = s.query(Workout)
    if u.role == "student":
        q = q.filter((Workout.student_id == u.id) | ((Workout.student_id.is_(None)) & (Workout.professor_id.is_(None))))
    elif u.role == "professor":
        q = q.filter((Workout.professor_id == u.id) | ((Workout.student_id.is_(None)) & (Workout.professor_id.is_(None))))
    return [
        {
            "id": x.id,
            "student_id": x.student_id,
            "title": x.title,
            "content": x.content,
            "periodization": x.periodization,
            "updated_at": x.updated_at,
        }
        for x in q.all()
    ]


@app.post("/api/workouts")
def save_workout(x: WorkoutIn, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    st = s.get(User, x.student_id)
    if not st or st.role != "student" or (u.role != "admin" and st.professor_id != u.id):
        raise HTTPException(403)
    w = Workout(professor_id=u.id, **x.model_dump())
    s.add(w)
    s.commit()
    s.add(WorkoutNotification(student_id=x.student_id,message=f"Novo treino disponível: {w.title}"));s.commit()
    return {"id": w.id}


@app.put("/api/workouts/{wid}")
def edit_workout(wid: int, x: WorkoutIn, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    w=s.get(Workout,wid)
    st=s.get(User,x.student_id)
    if not w or (u.role!="admin" and w.professor_id!=u.id): raise HTTPException(404)
    if not st or (u.role!="admin" and st.professor_id!=u.id): raise HTTPException(403)
    w.student_id=x.student_id;w.title=x.title;w.content=x.content;w.periodization=x.periodization;w.updated_at=datetime.utcnow()
    s.add(WorkoutNotification(student_id=x.student_id,message=f"Treino atualizado: {w.title}"))
    s.commit()
    return {"ok":True}


@app.delete("/api/workouts/{wid}")
def delete_workout(wid: int, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    w=s.get(Workout,wid)
    if not w or (u.role!="admin" and w.professor_id!=u.id): raise HTTPException(404)
    s.query(WorkoutSet).filter(WorkoutSet.workout_id==wid).delete()
    s.query(Completion).filter(Completion.workout_id==wid).delete()
    s.delete(w);s.commit()
    return {"ok":True}


@app.get("/api/workouts/{wid}")
def workout_detail(wid: int, u=Depends(me), s: Session = Depends(db)):
    w = s.get(Workout, wid)
    if not w:
        raise HTTPException(404, "Treino não encontrado")
    is_demo = w.student_id is None and w.professor_id is None
    if not is_demo and u.role == "student" and w.student_id != u.id:
        raise HTTPException(403)
    if not is_demo and u.role == "professor" and w.professor_id != u.id:
        raise HTTPException(403)
    return {
        "id": w.id,
        "student_id": w.student_id,
        "title": w.title,
        "content": w.content,
        "periodization": w.periodization,
        "updated_at": w.updated_at,
    }


@app.post("/api/workouts/{wid}/complete")
def complete(wid: int, session_key: str, u=Depends(me), s: Session = Depends(db)):
    if u.role != "student":
        raise HTTPException(403)
    w = s.get(Workout, wid)
    if not w or w.student_id != u.id:
        raise HTTPException(404)
    current = s.query(WorkoutSet).filter_by(student_id=u.id, workout_id=wid, session_key=session_key).all()
    previous = s.query(Completion).filter_by(student_id=u.id, workout_id=wid).order_by(Completion.completed_at.desc(), Completion.id.desc()).limit(2).all()
    baseline = {}
    if previous:
        query = s.query(WorkoutSet).filter_by(student_id=u.id, workout_id=wid, session_key=None).filter(WorkoutSet.performed_at <= previous[0].completed_at)
        if len(previous) > 1:
            query = query.filter(WorkoutSet.performed_at > previous[1].completed_at)
        for row in query.order_by(WorkoutSet.performed_at, WorkoutSet.id).all():
            baseline[(row.exercise_key, row.set_number)] = row
    progress = []
    compared = 0
    for row in current:
        prior = baseline.get((row.exercise_key, row.set_number))
        if not prior or prior.load_unit != row.load_unit:
            continue
        compared += 1
        if row.load_kg > prior.load_kg or (row.reps is not None and prior.reps is not None and row.reps > prior.reps):
            progress.append({"exercise": row.exercise_name, "series": row.set_number, "unit": row.load_unit, "old_load": prior.load_kg, "load": row.load_kg, "old_reps": prior.reps, "reps": row.reps})
    s.query(WorkoutSet).filter_by(student_id=u.id, workout_id=wid, session_key=session_key).update({WorkoutSet.session_key: None})
    s.add(Completion(student_id=u.id, workout_id=wid))
    s.commit()
    today = date.today()
    start = today - timedelta(days=today.weekday())
    week = sum(start <= x.completed_at.date() <= today for x in s.query(Completion).filter_by(student_id=u.id).all())
    return {"ok": True, "week": week, "progress": progress, "compared": compared}


@app.get("/api/weights/{sid}")
def weights(sid: int, u=Depends(me), s: Session = Depends(db)):
    if u.role == "student" and sid != u.id:
        raise HTTPException(403)
    if u.role == "professor":
        st = s.get(User, sid)
        if not st or st.professor_id != u.id:
            raise HTTPException(403)
    return [
        {"value": x.value, "measured_on": x.measured_on}
        for x in s.query(Weight)
        .filter(Weight.student_id == sid)
        .order_by(Weight.measured_on)
        .all()
    ]


@app.post("/api/weights")
def add_weight(x: WeightIn, u=Depends(me), s: Session = Depends(db)):
    if u.role != "student":
        raise HTTPException(403)
    s.add(Weight(student_id=u.id, **x.model_dump()))
    s.commit()
    return {"ok": True}


@app.post("/api/photos")
async def photos(
    files: List[UploadFile] = File(...), u=Depends(me), s: Session = Depends(db)
):
    if u.role != "student":
        raise HTTPException(403)
    if not files:
        raise HTTPException(400, "Selecione ao menos uma foto")
    saved = []
    allowed = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    max_bytes = 4 * 1024 * 1024
    for file in files:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in allowed:
            raise HTTPException(400, f"Formato inválido: {file.filename}")
        content = await file.read()
        if len(content) > max_bytes:
            raise HTTPException(400, f"A foto {file.filename} excede o limite de 4 MB")
        mime = allowed[ext]
        path = f"data:{mime};base64,{base64.b64encode(content).decode('ascii')}"
        s.add(Photo(student_id=u.id, path=path))
        saved.append({"filename": file.filename, "stored": True})
    s.commit()
    return {"files": saved, "count": len(saved)}


@app.get("/api/photos/{sid}")
def student_photos(sid: int, u=Depends(me), s: Session = Depends(db)):
    st = s.get(User, sid)
    if not st or st.role != "student":
        raise HTTPException(404, "Aluno não encontrado")
    if u.role == "student" and sid != u.id:
        raise HTTPException(403)
    if u.role == "professor" and st.professor_id != u.id:
        raise HTTPException(403)
    rows = (
        s.query(Photo)
        .filter(Photo.student_id == sid)
        .order_by(Photo.created_at.desc())
        .all()
    )
    return [{"id": x.id, "path": x.path, "created_at": x.created_at} for x in rows]


CYCLES = {"mensal": 1, "trimestral": 3, "semestral": 6, "anual": 12}

def add_months(day, count):
    month = day.month - 1 + count
    year = day.year + month // 12
    month = month % 12 + 1
    return date(year, month, min(day.day, calendar.monthrange(year, month)[1]))

class PaymentPlanIn(BaseModel):
    student_id: int
    start_date: date
    cycle: str
    amount: Optional[float] = None

class PaymentUpdate(BaseModel):
    paid: bool

@app.get("/api/payments")
def get_payments(u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    today = date.today()
    result = []
    students = s.query(User).filter(User.role == "student", User.professor_id == u.id).order_by(User.name).all()
    for student in students:
        plan = s.query(PaymentPlan).filter_by(student_id=student.id, professor_id=u.id).first()
        payments = []
        if plan:
            # Gerar vencimentos até 12 meses à frente, mantendo o dia-base original.
            end = add_months(today, 12)
            n = 0
            while n < 600:
                due = add_months(plan.start_date, n * CYCLES[plan.cycle])
                if due > end: break
                if due >= plan.start_date:
                    existing = s.query(Payment).filter_by(plan_id=plan.id, due_date=due).first()
                    if not existing:
                        existing = Payment(plan_id=plan.id, due_date=due, paid=False)
                        s.add(existing)
                n += 1
            s.commit()
            for payment in s.query(Payment).filter_by(plan_id=plan.id).order_by(Payment.due_date).all():
                payments.append({"id": payment.id, "due_date": payment.due_date.isoformat(), "paid": payment.paid, "overdue": not payment.paid and payment.due_date < today, "alert": not payment.paid and payment.due_date <= today - timedelta(days=1)})
        result.append({"student_id": student.id, "student_name": student.name, "cycle": plan.cycle if plan else None, "start_date": plan.start_date.isoformat() if plan else None, "amount": plan.amount if plan else None, "payments": payments})
    return result

@app.put("/api/payments/plan")
def put_payment_plan(x: PaymentPlanIn, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    student = s.get(User, x.student_id)
    if not student or student.role != "student" or student.professor_id != u.id:
        raise HTTPException(404, "Aluno não encontrado")
    if x.cycle not in CYCLES: raise HTTPException(400, "Periodicidade inválida")
    if x.amount is not None and x.amount < 0: raise HTTPException(400, "Valor inválido")
    plan = s.query(PaymentPlan).filter_by(student_id=student.id).first()
    if plan:
        # Não apagar registros quitados; exigir confirmação administrativa para mudar um plano com pagamentos.
        if s.query(Payment).filter_by(plan_id=plan.id, paid=True).first():
            raise HTTPException(409, "Há pagamentos quitados neste plano; não é possível alterar a recorrência sem preservar o histórico")
        s.query(Payment).filter_by(plan_id=plan.id).delete()
        plan.start_date, plan.cycle, plan.amount = x.start_date, x.cycle, x.amount
    else:
        s.add(PaymentPlan(student_id=student.id, professor_id=u.id, start_date=x.start_date, cycle=x.cycle, amount=x.amount))
    s.commit()
    return {"ok": True}

@app.patch("/api/payments/{payment_id}")
def set_payment(payment_id: int, x: PaymentUpdate, u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    payment = s.get(Payment, payment_id)
    plan = s.get(PaymentPlan, payment.plan_id) if payment else None
    if not plan or plan.professor_id != u.id: raise HTTPException(404, "Pagamento não encontrado")
    payment.paid = x.paid
    payment.paid_at = datetime.utcnow() if x.paid else None
    s.commit()
    return {"ok": True}

@app.get("/api/payments/alerts")
def payment_alerts(u=Depends(me), s: Session = Depends(db)):
    allow_prof(u)
    today = date.today()
    rows = s.query(Payment, PaymentPlan, User).join(PaymentPlan, Payment.plan_id == PaymentPlan.id).join(User, PaymentPlan.student_id == User.id).filter(PaymentPlan.professor_id == u.id, Payment.paid == False, Payment.due_date < today).order_by(Payment.due_date).all()
    return [{"student_name": student.name, "due_date": payment.due_date.isoformat(), "days_late": (today - payment.due_date).days} for payment, plan, student in rows]

# Notificação externa opcional: Vercel Cron chama este endpoint diariamente.
# Requer CRON_SECRET, RESEND_API_KEY, MAYCK_ALERT_EMAIL e RESEND_FROM_EMAIL.

class SetEntry(BaseModel):
    workout_id:int
    exercise_key:str
    exercise_name:str
    set_number:int
    load_kg:float
    load_unit: str = "kg"
    reps: Optional[int] = None
    entry_id: Optional[int] = None
    session_key: str

@app.post("/api/workout-sets")
def record_set(x:SetEntry,u=Depends(me),s:Session=Depends(db)):
    if u.role!="student":raise HTTPException(403)
    w=s.get(Workout,x.workout_id)
    if not w or w.student_id!=u.id:raise HTTPException(404)
    try: exercises=json.loads(w.content)
    except (ValueError,TypeError):exercises=[]
    match=next((e for i,e in enumerate(exercises) if isinstance(e,dict) and str(e.get("key") or f"exercise-{i}")==x.exercise_key),None) if isinstance(exercises,list) else None
    if not match or x.exercise_name!=match.get("name") or x.set_number<1 or x.set_number>int(match.get("sets",0)) or not 0<=x.load_kg<=2000:raise HTTPException(400,"Série inválida")
    if x.load_unit not in ("kg", "lbs", "p"): raise HTTPException(400, "Unidade inválida")
    if x.reps is not None and not 0 <= x.reps <= 1000: raise HTTPException(400, "Repetições inválidas")
    if x.entry_id is not None:
        row=s.get(WorkoutSet,x.entry_id)
        if not row or row.session_key != x.session_key or (row.student_id,row.workout_id,row.exercise_key,row.set_number)!=(u.id,w.id,x.exercise_key,x.set_number): raise HTTPException(404)
        row.load_kg=x.load_kg; row.reps=x.reps; row.load_unit=x.load_unit
    else:
        row=WorkoutSet(workout_id=w.id,student_id=u.id,exercise_key=x.exercise_key,exercise_name=x.exercise_name,set_number=x.set_number,load_kg=x.load_kg,load_unit=x.load_unit,reps=x.reps,session_key=x.session_key)
        s.add(row)
    s.commit(); s.refresh(row); return {"ok":True,"id":row.id}

@app.delete("/api/workout-sets/{wid}/session/{session_key}")
def cancel_session(wid:int, session_key:str, u=Depends(me), s:Session=Depends(db)):
    if u.role != "student": raise HTTPException(403)
    s.query(WorkoutSet).filter_by(student_id=u.id, workout_id=wid, session_key=session_key).delete()
    s.commit()
    return {"ok":True}

@app.get("/api/students/{sid}/frequency")
def student_frequency(sid:int, u=Depends(me), s:Session=Depends(db)):
    st=s.get(User,sid)
    if u.role != "professor" or not st or st.role != "student" or st.professor_id != u.id: raise HTTPException(404)
    today=date.today()
    dates=[x.completed_at.date() for x in s.query(Completion).filter_by(student_id=sid).all()]
    return {"week":sum(today-timedelta(days=today.weekday()) <= d <= today for d in dates), "month":sum(d.year==today.year and d.month==today.month and d<=today for d in dates)}

@app.get("/api/workout-sets/{wid}")
def workout_sets(wid:int,u=Depends(me),s:Session=Depends(db)):
    w=s.get(Workout,wid)
    if not w or (u.id!=w.student_id and u.id!=w.professor_id):raise HTTPException(404)
    return [{"exercise_key":x.exercise_key,"exercise_name":x.exercise_name,"set_number":x.set_number,"load_kg":x.load_kg,"load_unit":x.load_unit,"reps":x.reps,"performed_at":x.performed_at.isoformat()} for x in s.query(WorkoutSet).filter_by(workout_id=wid,student_id=w.student_id,session_key=None).order_by(WorkoutSet.performed_at).all()]

# Arquivos de exercícios: armazenamento persistente no banco (compatível com hospedagem efêmera).
from fastapi.responses import Response
class ExerciseMedia(Base):
    __tablename__ = 'exercise_media'
    id = Column(String, primary_key=True)
    professor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    mime = Column(String, nullable=False)
    payload = Column(Text, nullable=False)

Base.metadata.create_all(bind=engine)

@app.post('/api/exercise-media')
async def upload_exercise_media(file: UploadFile = File(...), u=Depends(me), s: Session=Depends(db)):
    if u.role != 'professor': raise HTTPException(403, 'Somente professores podem enviar mídias')
    allowed = {'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','video/mp4':'.mp4','video/webm':'.webm'}
    if file.content_type not in allowed: raise HTTPException(400,'Formato não permitido')
    data = await file.read(12*1024*1024+1)
    if not data or len(data)>12*1024*1024: raise HTTPException(400,'Arquivo vazio ou maior que 12 MB')
    key = uuid.uuid4().hex + allowed[file.content_type]
    s.add(ExerciseMedia(id=key, professor_id=u.id, mime=file.content_type, payload=base64.b64encode(data).decode('ascii')))
    s.commit()
    return {'url':'/api/exercise-media/'+key}

@app.get('/api/exercise-media/{key}')
def read_exercise_media(key:str,s:Session=Depends(db)):
    # URLs aleatórias não enumeráveis; evitar divulgar os endereços fora dos treinos.
    row=s.get(ExerciseMedia,key)
    if not row: raise HTTPException(404)
    return Response(content=base64.b64decode(row.payload),media_type=row.mime,headers={'Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'})

@app.get('/api/app-membership/pix')
def membership_pix(u=Depends(me)):
    allow_prof(u)
    key=os.getenv('PIX_KEY','').strip()
    name=os.getenv('PIX_RECEIVER_NAME','').strip()
    city=os.getenv('PIX_RECEIVER_CITY','').strip()
    if not all((key,name,city)):
        return {'configured':False}
    import io, unicodedata, qrcode
    def clean(v,n):
        return unicodedata.normalize('NFKD',v).encode('ascii','ignore').decode().upper()[:n]
    def tlv(tag,v):
        if len(v.encode())>99: raise HTTPException(500,'Configuração Pix inválida')
        return tag+f'{len(v.encode()):02d}'+v
    payload=tlv('00','01')+tlv('26',tlv('00','br.gov.bcb.pix')+tlv('01',key))+tlv('52','0000')+tlv('53','986')+tlv('54','30.00')+tlv('58','BR')+tlv('59',clean(name,25))+tlv('60',clean(city,15))+tlv('62',tlv('05','***'))+'6304'
    import binascii
    payload+=f'{binascii.crc_hqx(payload.encode(),0xffff):04X}'
    buf=io.BytesIO(); qrcode.make(payload).save(buf,format='PNG')
    return {'configured':True,'payload':payload,'image':'data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()}
