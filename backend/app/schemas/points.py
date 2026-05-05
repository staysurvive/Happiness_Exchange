from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PointTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: int
    balance_after: int
    transaction_type: str
    description: str | None
    created_at: datetime


class PointsBalanceResponse(BaseModel):
    points_balance: int


class PointsSummaryResponse(BaseModel):
    points_balance: int
    total: int
    page: int
    page_size: int
    point_transactions: list[PointTransactionResponse]


class PointTransactionsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[PointTransactionResponse]
