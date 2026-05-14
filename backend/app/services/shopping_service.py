from collections import defaultdict
from app.models.schemas import MealPlan, ShoppingCategory, ShoppingItem
from app.prompts.meal_plan_prompts import DAY_JP, MEAL_JP

CATEGORY_KEYWORDS = {
    "肉・魚類": ["肉", "鶏", "豚", "牛", "魚", "サーモン", "鮭", "マグロ", "エビ", "イカ", "タコ", "ひき肉", "ベーコン", "ソーセージ", "ハム"],
    "野菜": ["キャベツ", "玉ねぎ", "ねぎ", "ニンジン", "人参", "じゃがいも", "ジャガイモ", "ほうれん草", "トマト", "きゅうり", "ナス", "なす", "ピーマン", "レタス", "白菜", "大根", "ブロッコリー", "もやし", "ゴーヤ", "アスパラ", "セロリ", "ほうれん", "小松菜"],
    "卵・乳製品": ["卵", "たまご", "チーズ", "牛乳", "ミルク", "バター", "生クリーム", "ヨーグルト"],
    "調味料": ["醤油", "みりん", "砂糖", "塩", "酢", "ごま油", "サラダ油", "オリーブオイル", "味噌", "コンソメ", "だし", "片栗粉", "小麦粉", "ケチャップ", "マヨネーズ", "ソース", "ポン酢", "生姜", "にんにく", "唐辛子", "胡椒", "こしょう"],
}


def _categorize(name: str) -> str:
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in name:
                return category
    return "その他"


def aggregate_shopping_list(meal_plan: MealPlan) -> list[ShoppingCategory]:
    ingredient_map: dict[str, dict] = defaultdict(lambda: {"amounts": [], "used_in": []})

    for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
        day_meals = getattr(meal_plan, day)
        for meal_type in ["breakfast", "lunch", "dinner"]:
            meal = getattr(day_meals, meal_type)
            if meal is None:
                continue
            label = f"{DAY_JP[day]}・{MEAL_JP[meal_type]}"
            for ing in meal.ingredients:
                ingredient_map[ing.name]["amounts"].append(ing.amount)
                ingredient_map[ing.name]["used_in"].append(label)

    category_map: dict[str, list[ShoppingItem]] = defaultdict(list)
    for name, info in ingredient_map.items():
        amounts = info["amounts"]
        # 同一の量が複数あれば集約（例: "200g" x3 → "200g × 3"）
        if len(set(amounts)) == 1:
            total = f"{amounts[0]} × {len(amounts)}" if len(amounts) > 1 else amounts[0]
        else:
            total = "、".join(amounts)

        category = _categorize(name)
        category_map[category].append(ShoppingItem(
            name=name,
            total_amount=total,
            used_in=info["used_in"],
        ))

    order = ["肉・魚類", "野菜", "卵・乳製品", "調味料", "その他"]
    result = []
    for cat in order:
        if cat in category_map:
            result.append(ShoppingCategory(category=cat, items=category_map[cat]))
    return result
