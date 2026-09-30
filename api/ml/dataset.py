"""
Meteorological Dataset Loader & Time-Split Splitter:
Constructs paired meteorological feature matrices and ground-truth onset/break labels.
"""

from typing import Tuple, List, Dict, Any

def create_time_series_splits(
    records: List[Dict[str, Any]],
    train_ratio: float = 0.7,
    val_ratio: float = 0.15
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Time-based contiguous train/val/test splitting to prevent future-data leakage in meteorological forecasts.
    """
    if not records:
        return [], [], []

    n = len(records)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))

    train_data = records[:train_end]
    val_data = records[train_end:val_end]
    test_data = records[val_end:]

    return train_data, val_data, test_data
