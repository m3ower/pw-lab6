const STARS = n => '★'.repeat(n ?? 0) + '☆'.repeat(5 - (n ?? 0));

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function sortedChapters(chapters = []) {
  return [...chapters].sort((a, b) => a.number - b.number);
}

// ── Plain text ──────────────────────────────────────────────
export function exportAsText(book) {
  const lines = [];

  lines.push(book.title.toUpperCase());
  lines.push(`by ${book.author}`);
  if (book.genre?.length)   lines.push(`Genre: ${book.genre.join(', ')}`);
  if (book.dateStarted)     lines.push(`Started:  ${fmtDate(book.dateStarted)}`);
  if (book.dateFinished)    lines.push(`Finished: ${fmtDate(book.dateFinished)}`);
  if (book.rating)          lines.push(`Rating: ${STARS(book.rating)}`);
  lines.push('');
  lines.push('─'.repeat(60));

  if (book.notes) {
    lines.push('');
    lines.push('REVIEW & NOTES');
    lines.push('─'.repeat(30));
    lines.push(book.notes);
  }

  const chapters = sortedChapters(book.chapters);
  if (chapters.length) {
    lines.push('');
    lines.push('CHAPTER NOTES');
    lines.push('─'.repeat(60));

    for (const ch of chapters) {
      lines.push('');
      const heading = ch.name
        ? `Chapter ${ch.number} — ${ch.name}`
        : `Chapter ${ch.number}`;
      lines.push(heading);
      if (ch.dateRead)  lines.push(`  Read: ${fmtDate(ch.dateRead)}`);
      if (ch.rating)    lines.push(`  Rating: ${STARS(ch.rating)}`);
      if (ch.notes) {
        lines.push('');
        lines.push('  Notes:');
        ch.notes.split('\n').forEach(l => lines.push(`    ${l}`));
      }
      const quotes = ch.quotes?.filter(q => q.trim()) ?? [];
      if (quotes.length) {
        lines.push('');
        lines.push('  Quotes:');
        quotes.forEach(q => lines.push(`    "${q}"`));
      }
      if (ch.questions) {
        lines.push('');
        lines.push('  Questions / Reactions:');
        ch.questions.split('\n').forEach(l => lines.push(`    ${l}`));
      }
      lines.push('  ' + '·'.repeat(40));
    }
  }

  lines.push('');
  lines.push(`Exported from My Shelf on ${fmtDate(new Date().toISOString())}`);

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}_notes.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Print / PDF ─────────────────────────────────────────────
export function exportAsPrint(book) {
  const chapters = sortedChapters(book.chapters);

  const chapterHTML = chapters.map(ch => {
    const quotes = ch.quotes?.filter(q => q.trim()) ?? [];
    return `
      <div class="chapter">
        <div class="chapter-header">
          <h3>${ch.name ? `Chapter ${ch.number} — ${ch.name}` : `Chapter ${ch.number}`}</h3>
          <div class="chapter-meta">
            ${ch.dateRead ? `<span>${fmtDate(ch.dateRead)}</span>` : ''}
            ${ch.rating   ? `<span>${STARS(ch.rating)}</span>` : ''}
            ${ch.isRead   ? '<span class="tag">Read</span>' : ''}
          </div>
        </div>
        ${ch.notes ? `<div class="field"><div class="field-label">Notes</div><p>${ch.notes.replace(/\n/g, '<br>')}</p></div>` : ''}
        ${quotes.length ? `
          <div class="field">
            <div class="field-label">Quotes</div>
            ${quotes.map(q => `<blockquote>"${q}"</blockquote>`).join('')}
          </div>` : ''}
        ${ch.questions ? `<div class="field"><div class="field-label">Questions &amp; Reactions</div><p>${ch.questions.replace(/\n/g, '<br>')}</p></div>` : ''}
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${book.title} — Notes</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Lato', serif; font-size: 11pt; color: #1C0F07; line-height: 1.65; padding: 36pt 48pt; max-width: 700px; margin: 0 auto; }
  h1 { font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 700; color: #1C0F07; }
  h2 { font-family: 'Playfair Display', serif; font-size: 14pt; font-weight: 600; margin: 28pt 0 8pt; border-bottom: 1px solid #D8CFC3; padding-bottom: 6pt; }
  h3 { font-family: 'Playfair Display', serif; font-size: 11pt; font-weight: 600; }
  .book-header { margin-bottom: 24pt; padding-bottom: 16pt; border-bottom: 2px solid #7B3F20; }
  .author { font-size: 12pt; color: #4E342E; font-style: italic; margin: 4pt 0 8pt; }
  .meta { display: flex; gap: 16pt; flex-wrap: wrap; font-size: 9pt; color: #8D6E63; margin-top: 8pt; }
  .stars { color: #7B3F20; letter-spacing: 1px; }
  .review { background: #F5F1EA; border-left: 3px solid #7B3F20; padding: 10pt 14pt; border-radius: 2pt; font-style: italic; color: #4E342E; margin-bottom: 16pt; }
  .chapter { margin-bottom: 18pt; padding-bottom: 14pt; border-bottom: 1px solid #EDE7DC; }
  .chapter:last-child { border-bottom: none; }
  .chapter-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8pt; }
  .chapter-meta { font-size: 9pt; color: #8D6E63; display: flex; gap: 10pt; }
  .tag { background: #EDE7DC; padding: 1pt 6pt; border-radius: 10pt; }
  .field { margin-top: 8pt; }
  .field-label { font-size: 8pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #8D6E63; margin-bottom: 4pt; }
  .field p { color: #4E342E; font-weight: 300; }
  blockquote { border-left: 2px solid #7B3F20; padding: 5pt 10pt; margin: 5pt 0; font-family: 'Playfair Display', serif; font-style: italic; color: #4E342E; font-size: 10pt; }
  .footer { margin-top: 24pt; font-size: 8pt; color: #8D6E63; text-align: center; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="book-header">
    <h1>${book.title}</h1>
    <p class="author">by ${book.author}</p>
    <div class="meta">
      ${book.genre?.length  ? `<span>${book.genre.join(', ')}</span>` : ''}
      ${book.dateStarted    ? `<span>Started ${fmtDate(book.dateStarted)}</span>` : ''}
      ${book.dateFinished   ? `<span>Finished ${fmtDate(book.dateFinished)}</span>` : ''}
      ${book.rating         ? `<span class="stars">${STARS(book.rating)}</span>` : ''}
    </div>
  </div>

  ${book.notes ? `<h2>Review &amp; Notes</h2><div class="review">${book.notes.replace(/\n/g, '<br>')}</div>` : ''}
  ${chapters.length ? `<h2>Chapter Notes</h2>${chapterHTML}` : ''}

  <div class="footer">Exported from My Shelf · ${fmtDate(new Date().toISOString())}</div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}
