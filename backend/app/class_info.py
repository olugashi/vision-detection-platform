"""Single source of truth for detectable COCO classes."""

CLASS_INFO: dict[int, tuple[str, tuple[int, int, int]]] = {
    0: ("person",     (68,  68,  255)),
    1: ("bicycle",    (170, 170, 0)),
    2: ("car",        (255, 68,  68)),
    3: ("motorcycle", (0,   170, 0)),
    4: ("airplane",   (0,   220, 220)),
    5: ("bus",        (255, 0,   136)),
    7: ("truck",      (0,   136, 255)),
    8: ("boat",       (180, 105, 255)),
}

ALLOWED_CLASSES: set[int] = set(CLASS_INFO.keys())
CLASS_NAMES: dict[int, str] = {k: v[0] for k, v in CLASS_INFO.items()}
