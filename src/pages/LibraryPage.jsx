import './LibraryPage.css';

export default function LibraryPage() {
  return (
    <div className="library-page container">
      <header className="library-header">
        <div>
          <p className="library-eyebrow">Your collection</p>
          <h1>Library</h1>
        </div>
        <button className="btn-primary">Add Book</button>
      </header>

      <div className="empty-state">
        <div className="empty-ornament" aria-hidden="true" />
        <h2>Your shelf is empty</h2>
        <p>Start building your reading collection by adding your first book.</p>
        <button className="btn-primary">Add your first book</button>
      </div>
    </div>
  );
}
