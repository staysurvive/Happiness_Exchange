from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
import os

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.checkin import Checkin
from app.models.emotion_product import EmotionProduct
from app.models.joy_gift import JoyGift
from app.models.product_collection import ProductCollection
from app.models.product_comment import ProductComment
from app.models.product_like import ProductLike
from app.models.purchase import Purchase
from app.models.user import User
from app.repositories.checkin_repository import CheckinRepository
from app.repositories.joy_gift_repository import JoyGiftRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.user_repository import UserRepository
from app.services.interaction_service import InteractionService
from app.services.point_service import PointService

# Override this in your shell before seeding demo data for shared environments.
DEMO_PASSWORD = os.getenv("HAPPY_EXCHANGE_DEMO_PASSWORD", "change-me-demo-password")
NOW = datetime.now(timezone.utc)

AVATAR_URLS = [
    "/preset-assets/avatars/0426efc8-4afb-4b61-bae2-da4e48effb2f.png",
    "/preset-assets/avatars/0e5060cd-9bfb-4c82-9c5a-c78897f5dbe8.png",
    "/preset-assets/avatars/923f44a9-09ef-413b-9b3b-18de24b0cda2.png",
    "/preset-assets/avatars/c79e93ea-0592-4052-b23d-8f8e7ad15396.png",
]

DEMO_IMAGES = {
    "animal_01": "/preset-assets/covers/demo/dongwu-web/cover-01.jpg",
    "animal_02": "/preset-assets/covers/demo/dongwu-web/cover-02.jpg",
    "animal_03": "/preset-assets/covers/demo/dongwu-web/cover-03.jpg",
    "animal_04": "/preset-assets/covers/demo/dongwu-web/cover-04.jpg",
    "animal_05": "/preset-assets/covers/demo/dongwu-web/cover-05.jpg",
    "animal_06": "/preset-assets/covers/demo/dongwu-web/cover-06.jpg",
    "animal_07": "/preset-assets/covers/demo/dongwu-web/cover-07.jpg",
    "animal_08": "/preset-assets/covers/demo/dongwu-web/cover-08.jpg",
    "animal_09": "/preset-assets/covers/demo/dongwu-web/cover-09.jpg",
    "animal_10": "/preset-assets/covers/demo/dongwu-web/cover-10.jpg",
    "animal_11": "/preset-assets/covers/demo/dongwu-web/cover-11.jpg",
    "animal_12": "/preset-assets/covers/demo/dongwu-web/cover-12.jpg",
}


@dataclass(frozen=True)
class DemoUserSeed:
    username: str
    email: str
    bio: str
    avatar_url: str
    created_days_ago: int


@dataclass(frozen=True)
class DemoProductSeed:
    key: str
    author: str
    title: str
    description: str
    product_type: str
    mood_tags: list[str]
    price: int
    image_keys: list[str]
    created_days_ago: int


USERS = [
    DemoUserSeed(
        username="luna",
        email="luna@demo.happy",
        bio="擅长把普通日子里很轻的亮光收集起来。",
        avatar_url=AVATAR_URLS[0],
        created_days_ago=12,
    ),
    DemoUserSeed(
        username="river",
        email="river@demo.happy",
        bio="总想把风景里那一点让人松口气的时刻留下来。",
        avatar_url=AVATAR_URLS[1],
        created_days_ago=11,
    ),
    DemoUserSeed(
        username="coco",
        email="coco@demo.happy",
        bio="喜欢把猫猫狗狗和微小幸运分享给别人。",
        avatar_url=AVATAR_URLS[2],
        created_days_ago=10,
    ),
    DemoUserSeed(
        username="miya",
        email="miya@demo.happy",
        bio="专门记录那些不大但很真诚的小确幸。",
        avatar_url=AVATAR_URLS[3],
        created_days_ago=9,
    ),
    DemoUserSeed(
        username="yufan",
        email="yufan@demo.happy",
        bio="有点丧的时候，会认真给别人留一句鼓励。",
        avatar_url=AVATAR_URLS[0],
        created_days_ago=8,
    ),
    DemoUserSeed(
        username="noah",
        email="noah@demo.happy",
        bio="希望这个平台像一个可以随时补电的角落。",
        avatar_url=AVATAR_URLS[1],
        created_days_ago=7,
    ),
]

PRODUCTS = [
    DemoProductSeed(
        key="morning_tea",
        author="luna",
        title="晨光落在茶杯边缘的五分钟",
        description="今天醒得有点早，热茶刚好把手心暖住。窗边的光线一点点移过来，那五分钟里什么都没发生，但人忽然就没那么紧了。",
        product_type="healing_photo",
        mood_tags=["治愈", "温暖", "放松"],
        price=18,
        image_keys=["animal_07"],
        created_days_ago=6,
    ),
    DemoProductSeed(
        key="golden_coast",
        author="river",
        title="下班路上看到一整片发光海面",
        description="风很轻，海面像在慢慢呼吸。站了不到三分钟，脑子里那些嘈杂的声音就像被拉远了一点。",
        product_type="beautiful_view",
        mood_tags=["美好", "安心", "放松"],
        price=26,
        image_keys=["animal_03"],
        created_days_ago=6,
    ),
    DemoProductSeed(
        key="curled_kitten",
        author="coco",
        title="把尾巴圈成问号睡着的小橘猫",
        description="小猫睡得太认真了，连尾巴都卷成一个问号。看着它呼吸一下一下起伏，坏情绪也跟着慢了下来。",
        product_type="cute_pet",
        mood_tags=["可爱", "治愈", "开心"],
        price=22,
        image_keys=["animal_10"],
        created_days_ago=5,
    ),
    DemoProductSeed(
        key="puddle_rainbow",
        author="miya",
        title="雨后水洼里突然出现的小彩虹",
        description="只是低头看了一眼鞋尖，结果在水洼里看到一截很短很短的彩虹。那一秒觉得今天还是站在我这边的。",
        product_type="lucky_today",
        mood_tags=["惊喜", "美好", "放松"],
        price=12,
        image_keys=["animal_05"],
        created_days_ago=5,
    ),
    DemoProductSeed(
        key="free_candy",
        author="yufan",
        title="便利店门口那杯刚好暖手的热饮",
        description="风有点凉，杯壁却刚好把手心烘热。站在门口喝第一口的时候，整个人像被很轻地安慰了一下。",
        product_type="happy_moment",
        mood_tags=["温暖", "安心", "治愈"],
        price=9,
        image_keys=["animal_02"],
        created_days_ago=4,
    ),
    DemoProductSeed(
        key="low_battery_words",
        author="noah",
        title="一段送给低电量时刻的话",
        description="你不是非得一直高效、一直稳定、一直有答案。先把今天过完，先好好吃饭、喝水、休息，已经很了不起了。",
        product_type="encouragement",
        mood_tags=["安心", "温暖", "治愈"],
        price=15,
        image_keys=["animal_12"],
        created_days_ago=4,
    ),
    DemoProductSeed(
        key="quiet_sentences",
        author="luna",
        title="适合在心很乱时慢慢读的三句话",
        description="如果你现在很乱，可以先不要急着让自己好起来。先把呼吸放慢，允许情绪在这里待一会儿，世界不会因为你停一下就塌下来。",
        product_type="encouragement",
        mood_tags=["安心", "放松", "温暖"],
        price=13,
        image_keys=["animal_08"],
        created_days_ago=3,
    ),
    DemoProductSeed(
        key="leaf_dog",
        author="coco",
        title="楼下小橘猫抬头和我对视了三秒",
        description="它原本把自己团成一小团晒太阳，听见脚步声才慢慢抬头。那种安安静静、又有点信任你的眼神，会让人一下子柔软下来。",
        product_type="cute_pet",
        mood_tags=["可爱", "治愈", "温暖"],
        price=11,
        image_keys=["animal_04"],
        created_days_ago=3,
    ),
    DemoProductSeed(
        key="sea_breeze_evening",
        author="river",
        title="傍晚海风把坏情绪吹散了一点",
        description="本来只是想去走走，结果站在风里以后，突然觉得很多事情没必要今天就想明白。能松一口气，已经很值了。",
        product_type="beautiful_view",
        mood_tags=["放松", "美好", "治愈"],
        price=24,
        image_keys=["animal_09"],
        created_days_ago=2,
    ),
    DemoProductSeed(
        key="cloud_overtime",
        author="miya",
        title="傍晚路边那截忽然亮起来的小彩虹",
        description="雨刚停，路灯还没完全亮起，水面却先映出一小截彩虹。像忙乱的一天忽然被轻轻按了暂停，让人愿意再等一会儿天晴。",
        product_type="lucky_today",
        mood_tags=["惊喜", "美好", "治愈"],
        price=8,
        image_keys=["animal_01"],
        created_days_ago=2,
    ),
    DemoProductSeed(
        key="night_milk",
        author="noah",
        title="窗边的热茶把夜晚慢慢收好",
        description="灯光没有很亮，书页也翻得很慢。原本很满的一天，被窗边这杯热茶和一小片安静一点点收了尾。",
        product_type="healing_photo",
        mood_tags=["治愈", "安心", "温暖"],
        price=17,
        image_keys=["animal_11"],
        created_days_ago=1,
    ),
    DemoProductSeed(
        key="traffic_light_cloud",
        author="yufan",
        title="傍晚那片被晚霞烫亮的云",
        description="云走得很慢，边缘被光照得发亮。只是看着它待了一会儿，心里那些拧着的地方就松开了一点。",
        product_type="beautiful_view",
        mood_tags=["美好", "放松", "治愈"],
        price=10,
        image_keys=["animal_06"],
        created_days_ago=1,
    ),
]

LEGACY_PRODUCT_TITLES = {
    "free_candy": ["便利店阿姨多塞给我的那颗糖"],
    "leaf_dog": ["楼下小狗叼着树叶朝我冲过来"],
    "cloud_overtime": ["今日份冷笑话：云为什么也在加班"],
    "night_milk": ["热牛奶和窗边花影把晚上安静下来"],
    "traffic_light_cloud": ["等红灯时被一朵云认真取悦"],
}

CHECKIN_OFFSETS = {
    "luna": [9, 6, 3, 0],
    "river": [8, 5, 2, 0],
    "coco": [7, 4, 1],
    "miya": [6, 3, 0],
    "yufan": [5, 2, 0],
    "noah": [4, 1, 0],
}

PURCHASES = [
    ("miya", "morning_tea"),
    ("noah", "morning_tea"),
    ("luna", "golden_coast"),
    ("yufan", "golden_coast"),
    ("river", "curled_kitten"),
    ("noah", "curled_kitten"),
    ("coco", "puddle_rainbow"),
    ("luna", "low_battery_words"),
    ("miya", "leaf_dog"),
    ("river", "quiet_sentences"),
    ("coco", "traffic_light_cloud"),
    ("yufan", "night_milk"),
]

LIKES = [
    ("luna", "golden_coast"),
    ("luna", "curled_kitten"),
    ("luna", "night_milk"),
    ("river", "morning_tea"),
    ("river", "puddle_rainbow"),
    ("river", "low_battery_words"),
    ("coco", "morning_tea"),
    ("coco", "quiet_sentences"),
    ("coco", "traffic_light_cloud"),
    ("miya", "morning_tea"),
    ("miya", "golden_coast"),
    ("miya", "night_milk"),
    ("yufan", "curled_kitten"),
    ("yufan", "puddle_rainbow"),
    ("yufan", "leaf_dog"),
    ("noah", "morning_tea"),
    ("noah", "golden_coast"),
    ("noah", "traffic_light_cloud"),
]

COLLECTIONS = [
    ("luna", "curled_kitten"),
    ("luna", "puddle_rainbow"),
    ("river", "morning_tea"),
    ("river", "night_milk"),
    ("coco", "golden_coast"),
    ("coco", "low_battery_words"),
    ("miya", "quiet_sentences"),
    ("miya", "traffic_light_cloud"),
    ("yufan", "morning_tea"),
    ("yufan", "curled_kitten"),
    ("noah", "golden_coast"),
    ("noah", "leaf_dog"),
]

COMMENTS = [
    ("miya", "morning_tea", "这种安静感太真实了，看完就想给自己泡一杯热的。"),
    ("coco", "morning_tea", "有被这张图轻轻托住一下，适合下班后看。"),
    ("luna", "golden_coast", "海面发光那一下真的会让人瞬间安静。"),
    ("yufan", "golden_coast", "像替忙乱的一天按了一个暂停键。"),
    ("river", "curled_kitten", "小橘猫这个尾巴角度也太可爱了。"),
    ("noah", "curled_kitten", "情绪不好的时候看到这种小动物会立刻回一点血。"),
    ("coco", "puddle_rainbow", "这种小幸运真的会让人愿意再坚持一下。"),
    ("luna", "low_battery_words", "谢谢这段话，像有人提醒我可以慢一点。"),
    ("miya", "leaf_dog", "这个抬头看人的瞬间，真的会让人一下子心软下来。"),
    ("river", "quiet_sentences", "适合收藏下来，在脑子很吵的时候反复读。"),
    ("coco", "traffic_light_cloud", "这种被晚霞和云轻轻安慰一下的时刻我也很喜欢。"),
    ("yufan", "night_milk", "这个画面真的有一种‘今天到这里就够了’的感觉。"),
]

GIFTS = [
    ("miya", "morning_tea", "coco", "希望你今晚也能慢下来一点。"),
    ("luna", "golden_coast", "noah", "把这阵海风匿名转送给你。"),
    ("coco", "traffic_light_cloud", "river", "今天也给你留一份抬头就会开心的东西。"),
]


def get_or_create_user(user_repo: UserRepository, points: PointService, seed: DemoUserSeed) -> User:
    user = user_repo.get_by_email(seed.email)
    if user is None:
        user = user_repo.create(
            username=seed.username,
            email=seed.email,
            password_hash=hash_password(DEMO_PASSWORD),
            points_balance=0,
        )
        points.grant_register_bonus(user)

    user.username = seed.username
    user.bio = seed.bio
    user.avatar_url = seed.avatar_url
    user.is_active = True
    user.created_at = NOW - timedelta(days=seed.created_days_ago)
    user.updated_at = user.created_at
    user_repo.save(user)
    return user


def ensure_checkins(
    checkins: CheckinRepository,
    points: PointService,
    user: User,
    offsets: list[int],
) -> int:
    created = 0
    for offset in offsets:
        day = (NOW - timedelta(days=offset)).date()
        if checkins.get_by_user_and_date(user.id, day) is not None:
            continue
        checkin = checkins.create(user_id=user.id, checkin_date=day, reward_points=PointService.CHECKIN_REWARD)
        points.add_points(
            user=user,
            amount=PointService.CHECKIN_REWARD,
            transaction_type="checkin_reward",
            description="每日签到奖励",
        )
        checkin.created_at = datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=8)
        created += 1
    return created


def get_product_by_title(db, author_id: int, titles: list[str]) -> EmotionProduct | None:
    stmt = select(EmotionProduct).where(
        EmotionProduct.author_id == author_id,
        EmotionProduct.title.in_(titles),
    )
    return db.execute(stmt).scalar_one_or_none()


def get_or_create_product(
    db,
    product_repo: ProductRepository,
    points: PointService,
    users: dict[str, User],
    seed: DemoProductSeed,
) -> EmotionProduct:
    author = users[seed.author]
    image_urls = [DEMO_IMAGES[key] for key in seed.image_keys]
    candidate_titles = [seed.title, *LEGACY_PRODUCT_TITLES.get(seed.key, [])]
    product = get_product_by_title(db, author.id, candidate_titles)
    if product is None:
        product = product_repo.create_product(
            author_id=author.id,
            title=seed.title,
            description=seed.description,
            product_type=seed.product_type,
            mood_tags=seed.mood_tags,
            price=seed.price,
            image_urls=image_urls,
        )
        points.grant_publish_reward(author, related_product_id=product.id)

    product.title = seed.title
    product.description = seed.description
    product.product_type = seed.product_type
    product.mood_tags = seed.mood_tags
    product.price = seed.price
    product.cover_image_url = image_urls[0]
    product.status = "published"
    product.is_resellable = False
    product.is_limited = False
    product.stock_total = None
    product.stock_remaining = None
    product.created_at = NOW - timedelta(days=seed.created_days_ago, hours=seed.created_days_ago)
    product.updated_at = product.created_at
    product_repo.replace_images(product.id, image_urls)
    db.flush()
    return product


def has_comment(db, user_id: int, product_id: int, content: str) -> bool:
    stmt = select(ProductComment.id).where(
        ProductComment.user_id == user_id,
        ProductComment.product_id == product_id,
        ProductComment.content == content,
        ProductComment.is_deleted.is_(False),
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def has_gift(db, sender_id: int, recipient_id: int, product_id: int) -> bool:
    stmt = select(JoyGift.id).where(
        JoyGift.sender_id == sender_id,
        JoyGift.recipient_id == recipient_id,
        JoyGift.product_id == product_id,
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def seed() -> None:
    db = SessionLocal()
    user_repo = UserRepository(db)
    product_repo = ProductRepository(db)
    checkin_repo = CheckinRepository(db)
    gift_repo = JoyGiftRepository(db)
    points = PointService(db)
    interactions = InteractionService(db)

    try:
        created_users = 0
        created_products = 0
        created_checkins = 0
        created_purchases = 0
        created_likes = 0
        created_collections = 0
        created_comments = 0
        created_gifts = 0

        users: dict[str, User] = {}
        for seed_user in USERS:
            existing = user_repo.get_by_email(seed_user.email)
            user = get_or_create_user(user_repo, points, seed_user)
            if existing is None:
                created_users += 1
            users[seed_user.username] = user
        db.commit()

        for username, offsets in CHECKIN_OFFSETS.items():
            created_checkins += ensure_checkins(checkin_repo, points, users[username], offsets)
        db.commit()

        products: dict[str, EmotionProduct] = {}
        for seed_product in PRODUCTS:
            candidate_titles = [seed_product.title, *LEGACY_PRODUCT_TITLES.get(seed_product.key, [])]
            existing = get_product_by_title(db, users[seed_product.author].id, candidate_titles)
            product = get_or_create_product(db, product_repo, points, users, seed_product)
            if existing is None:
                created_products += 1
            products[seed_product.key] = product
        db.commit()

        for username, product_key in PURCHASES:
            buyer = users[username]
            product = products[product_key]
            if interactions.purchases.get_by_buyer_and_product(buyer.id, product.id) is None:
                interactions.purchase_product(product.id, buyer)
                created_purchases += 1

        for username, product_key in LIKES:
            user = users[username]
            product = products[product_key]
            if interactions.likes.get_by_user_and_product(user.id, product.id) is None:
                interactions.like_product(product.id, user)
                created_likes += 1

        for username, product_key in COLLECTIONS:
            user = users[username]
            product = products[product_key]
            if interactions.collections.get_by_user_and_product(user.id, product.id) is None:
                interactions.collect_product(product.id, user)
                created_collections += 1

        for username, product_key, content in COMMENTS:
            user = users[username]
            product = products[product_key]
            if not has_comment(db, user.id, product.id, content):
                interactions.create_comment(product.id, content, user)
                created_comments += 1

        for sender_name, product_key, recipient_name, message in GIFTS:
            sender = users[sender_name]
            recipient = users[recipient_name]
            product = products[product_key]
            if not has_gift(db, sender.id, recipient.id, product.id):
                gift_repo.create(
                    sender_id=sender.id,
                    recipient_id=recipient.id,
                    product_id=product.id,
                    message=message,
                    delivery_type="anonymous_stranger",
                )
                db.commit()
                created_gifts += 1

        user_total = db.execute(select(User)).scalars().all()
        product_total = db.execute(select(EmotionProduct).where(EmotionProduct.status == "published")).scalars().all()
        purchase_total = db.execute(select(Purchase)).scalars().all()
        like_total = db.execute(select(ProductLike)).scalars().all()
        collection_total = db.execute(select(ProductCollection)).scalars().all()
        comment_total = db.execute(
            select(ProductComment).where(ProductComment.is_deleted.is_(False))
        ).scalars().all()
        gift_total = db.execute(select(JoyGift)).scalars().all()
        checkin_total = db.execute(select(Checkin)).scalars().all()

        print("Demo content seeded.")
        print(f"Created users: {created_users}")
        print(f"Created products: {created_products}")
        print(f"Created checkins: {created_checkins}")
        print(f"Created purchases: {created_purchases}")
        print(f"Created likes: {created_likes}")
        print(f"Created collections: {created_collections}")
        print(f"Created comments: {created_comments}")
        print(f"Created gifts: {created_gifts}")
        print("-- Totals --")
        print(f"Users: {len(user_total)}")
        print(f"Published products: {len(product_total)}")
        print(f"Purchases: {len(purchase_total)}")
        print(f"Likes: {len(like_total)}")
        print(f"Collections: {len(collection_total)}")
        print(f"Comments: {len(comment_total)}")
        print(f"Gifts: {len(gift_total)}")
        print(f"Checkins: {len(checkin_total)}")
        print(f"Demo login: {USERS[0].email} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
