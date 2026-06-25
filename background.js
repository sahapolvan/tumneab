const bg = document.createElement('div');

bg.style.position = 'fixed';
bg.style.top = '0';
bg.style.left = '0';
bg.style.width = '100%';
bg.style.height = '100%';
bg.style.background =
'linear-gradient(to bottom, #87CEEB, #F3E9D2)';

bg.style.zIndex = '-1';

document.body.prepend(bg);
