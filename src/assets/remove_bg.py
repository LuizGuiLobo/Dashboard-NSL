"""
Remove o fundo branco do logo e salva como PNG transparente.
Uso: python3 src/assets/remove_bg.py
(requer logo-original.png na mesma pasta)
"""
from PIL import Image
import os

src = os.path.join(os.path.dirname(__file__), 'logo-original.png')
dst = os.path.join(os.path.dirname(__file__), 'logo.png')

img = Image.open(src).convert('RGBA')
data = img.getdata()

new_data = []
threshold = 230  # pixels mais brancos que isso viram transparentes
for r, g, b, a in data:
    if r > threshold and g > threshold and b > threshold:
        new_data.append((r, g, b, 0))  # transparente
    else:
        new_data.append((r, g, b, a))

img.putdata(new_data)
img.save(dst)
print(f'Salvo: {dst}')
