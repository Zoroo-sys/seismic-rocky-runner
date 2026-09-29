export function shareRun(outcome, score, timeLabel, accentHex, statusEl) {
  statusEl.textContent = 'Preparing image...';
  const canvas = renderCard(outcome, score, timeLabel, accentHex);

  canvas.toBlob(async (blob) => {
    if (!blob) {
      statusEl.textContent = 'Could not generate image.';
      return;
    }
    const file = new File([blob], 'seismic-rocky-runner.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Seismic Rocky Runner',
          text: `${outcome}. ${score} points, ${timeLabel} survived.`,
        });
        statusEl.textContent = 'Shared!';
        return;
      } catch (e) {
        // user backed out of the share sheet - fall through to a download instead
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seismic-rocky-runner.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    statusEl.textContent = 'Image downloaded. Share it anywhere.';
  }, 'image/png');
}

function renderCard(outcome, score, timeLabel, accentHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, 630);
  bg.addColorStop(0, '#0a1a12');
  bg.addColorStop(1, '#03080a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.strokeStyle = 'rgba(57,231,127,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(1200, 0, 260 + i * 90, 0, Math.PI / 2);
    ctx.stroke();
  }

  ctx.fillStyle = accentHex;
  ctx.font = '600 26px "Chakra Petch", sans-serif';
  ctx.fillText('SEISMIC ROCKY RUNNER', 70, 100);

  ctx.fillStyle = '#eaf6ee';
  ctx.font = '700 52px "Chakra Petch", sans-serif';
  wrapText(ctx, outcome, 70, 190, 1000, 60);

  ctx.fillStyle = accentHex;
  ctx.font = '700 96px "Chakra Petch", sans-serif';
  ctx.fillText(score, 70, 430);
  ctx.fillStyle = 'rgba(234,246,238,0.65)';
  ctx.font = '500 24px Inter, sans-serif';
  ctx.fillText('PRIVACY SCORE', 70, 465);

  ctx.fillStyle = '#eaf6ee';
  ctx.font = '700 40px "Chakra Petch", sans-serif';
  ctx.fillText(timeLabel, 70, 545);
  ctx.fillStyle = 'rgba(234,246,238,0.65)';
  ctx.font = '500 22px Inter, sans-serif';
  ctx.fillText('UPTIME SURVIVED', 70, 575);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = test;
    }
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, y + i * lineHeight));
}
