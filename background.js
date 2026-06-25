const bg = document.createElement('div');

bg.style.position = 'fixed';
bg.style.top = '0';
bg.style.left = '0';
bg.style.width = '100vw';
bg.style.height = '100vh';

bg.style.background =
'linear-gradient(to bottom, #87CEEB 0%, #E8F4FF 40%, #F7E7B6 100%)';

bg.style.zIndex = '-1';

document.body.prepend(bg);
