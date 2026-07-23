from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.profile_schema import ProfileCreate

def sync_profile(db: Session, profile_data: ProfileCreate):
    db_profile = db.query(User).filter(User.id == profile_data.id).first()
    
    if db_profile:
        # Se o perfil existe, mas o nome ainda é o padrão da trigger, ATUALIZA!
        if db_profile.nome == "Usuário Novo" and profile_data.nome != "Usuário Novo":
            db_profile.nome = profile_data.nome
            db.commit()
            db.refresh(db_profile)
        return db_profile
    
    # 2. Se não existe, cria um novo
    new_profile = User(
        id=profile_data.id,
        nome=profile_data.nome,
        email=profile_data.email,
        avatar_url=profile_data.avatar_url,
        role=profile_data.role
    )
    
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    return new_profile