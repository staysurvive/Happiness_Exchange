from pydantic import BaseModel


class PersonaCardResponse(BaseModel):
    archetype_key: str
    archetype_name: str
    headline: str
    summary: str
    dominant_mood_tag: str
    dominant_product_type: str
    vibe_tags: list[str]
    purchases_count: int
    collections_count: int
    published_count: int
    gifts_sent_count: int
    gifts_received_count: int
    happy_actions: int
