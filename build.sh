#!/bin/bash
set -e

echo "Installing base packages and headless OpenCV..."
pip install --no-cache-dir flask opencv-python-headless

echo "Installing PyTorch CPU..."
pip install --no-cache-dir torch==2.11.0+cpu torchvision==0.26.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu

echo "Installing EasyOCR..."
pip install --no-cache-dir easyocr

echo "Installing ultralytics (without overriding OpenCV)..."
pip install --no-cache-dir --no-deps ultralytics ultralytics-thop

echo "Force reinstalling headless OpenCV to remove any display-dependent version..."
pip install --no-cache-dir --force-reinstall opencv-python-headless

echo "Build complete."
