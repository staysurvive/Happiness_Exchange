import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.emotion_product import EmotionProduct
from app.models.product_comment import ProductComment


BACKUP_PATH = Path(__file__).resolve().parents[2] / '.runtime_logs' / 'repair_garbled_content_backup.json'


PRODUCT_TEMPLATES = {
    'happy_moment': {
        'title': '今天收到一句温柔的话',
        'description': '原本普通的一天，因为一句鼓励忽然变得轻一点，想把这份小小的快乐分享出去。',
        'mood_tags': ['温暖', '开心'],
    },
    'lucky_today': {
        'title': '今天的幸运小确幸',
        'description': '一个不经意的小惊喜，让今天忽然明亮起来，想把这份运气也分给你一点。',
        'mood_tags': ['惊喜', '美好'],
    },
    'healing_photo': {
        'title': '被这一幕轻轻治愈',
        'description': '只是随手记下的一张照片，却刚好把心情安放好了，希望你看到时也会放松一点。',
        'mood_tags': ['治愈', '放松'],
    },
    'beautiful_view': {
        'title': '下班路上的温柔晚霞',
        'description': '抬头那一刻，城市的天空忽然柔软下来，想把这片风景留给同样在赶路的你。',
        'mood_tags': ['治愈', '风景'],
    },
    'cute_pet': {
        'title': '一只小狗送来的好心情',
        'description': '它只是安静地看了我一眼，整个人却忽然放松下来，这份可爱值得被认真分享。',
        'mood_tags': ['可爱', '开心'],
    },
    'funny_joke': {
        'title': '今天被一句话逗笑了',
        'description': '笑点来得很突然，但那一瞬间的轻松很真实，希望你也能跟着笑一下。',
        'mood_tags': ['搞笑', '开心'],
    },
    'encouragement': {
        'title': '送你一句刚刚好的鼓励',
        'description': '你已经走了很远，不必总是逼自己完美，今天也请记得肯定一下自己。',
        'mood_tags': ['鼓励', '安心'],
    },
    'other': {
        'title': '想分享的一点快乐',
        'description': '不想让今天的小开心溜走，就把它认真放进快乐仓库，留给也需要温柔的人。',
        'mood_tags': ['美好'],
    },
}


def is_garbled_text(value: str | None) -> bool:
    if not value:
        return False
    stripped = value.strip()
    if len(stripped) < 2:
        return False
    return all(char in {'?', '？'} for char in stripped)


def is_garbled_tags(tags: list[str] | None) -> bool:
    if not tags:
        return False
    return all(is_garbled_text(tag) for tag in tags)


def product_template(product_type: str) -> dict[str, object]:
    return PRODUCT_TEMPLATES.get(product_type, PRODUCT_TEMPLATES['other'])


def backup_rows(products: list[EmotionProduct], comments: list[ProductComment]) -> None:
    BACKUP_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        'products': [
            {
                'id': item.id,
                'title': item.title,
                'description': item.description,
                'mood_tags': item.mood_tags,
            }
            for item in products
        ],
        'comments': [
            {
                'id': item.id,
                'content': item.content,
                'is_deleted': item.is_deleted,
            }
            for item in comments
        ],
    }
    BACKUP_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')


def repair_products(db: Session) -> int:
    products = db.query(EmotionProduct).all()
    repaired = []

    for product in products:
        template = product_template(product.product_type)
        changed = False

        if is_garbled_text(product.title):
            product.title = template['title']  # type: ignore[assignment]
            changed = True

        if is_garbled_text(product.description):
            product.description = template['description']  # type: ignore[assignment]
            changed = True

        if is_garbled_tags(product.mood_tags):
            product.mood_tags = template['mood_tags']  # type: ignore[assignment]
            changed = True

        if changed:
            repaired.append(product)

    return len(repaired)


def repair_comments(db: Session) -> int:
    comments = db.query(ProductComment).all()
    repaired = 0

    for index, comment in enumerate(comments, start=1):
        if is_garbled_text(comment.content):
            comment.content = f'谢谢分享，看到这里心情都变好了。#{index}'
            repaired += 1

    return repaired


def main() -> None:
    settings = get_settings()
    _ = settings

    with SessionLocal() as db:
        products = db.query(EmotionProduct).all()
        comments = db.query(ProductComment).all()
        backup_rows(products, comments)

        product_count = repair_products(db)
        comment_count = repair_comments(db)
        db.commit()

    print(
        json.dumps(
            {
                'backup_path': str(BACKUP_PATH),
                'repaired_products': product_count,
                'repaired_comments': comment_count,
            },
            ensure_ascii=False,
        )
    )


if __name__ == '__main__':
    main()
