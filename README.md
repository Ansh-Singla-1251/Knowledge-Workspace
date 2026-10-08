# Knowledge Workspace

A feature-rich, offline-first knowledge management workspace built using HTML, CSS, and vanilla JavaScript. Organize notes, connect ideas, visualize relationships, and manage documents through an interactive workspace.

## Features

- **Workspace Management:** Create and organize multiple workspaces.
- **Folder and Document Management:** Create, edit, organize, and delete folders and documents.
- **Block-Based Editor:** Build structured notes using different content blocks.
- **Offline-First Storage:** Persist workspace data locally using IndexedDB.
- **Autosave:** Save document changes without requiring manual saves.
- **Search and Filters:** Find documents using search, tags, favorites, and recent activity.
- **Document Connections:** Link related documents and explore backlinks.
- **Interactive Mind Maps:** Visualize workspaces, folders, documents, and their relationships.
- **Wikipedia Research:** Retrieve supplementary information through the Wikipedia API.
- **Trash and Recovery:** Restore deleted documents and manage trashed content.
- **Import and Export:** Import and export workspace data in JSON format.
- **File Attachments:** Attach files to documents.
- **Authentication UI:** Frontend login and signup pages with client-side session handling. No backend authentication or server-side account management is implemented.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- IndexedDB
- Local Storage
- SVG for interactive visualizations
- Wikipedia API

## Getting Started

1. Clone or download this repository.
2. Open the project folder in your code editor.
3. Run the project using a local development server, such as the Live Server extension in Visual Studio Code.
4. Open `index.html` through the local server in your browser.

A local server is recommended because the project uses JavaScript ES modules.

## Project Structure

```text
knowledge-workspace/
├── index.html
├── editor.html
├── documents.html
├── favorites.html
├── mindmaps.html
├── trash.html
├── login.html
├── signup.html
├── css/
│   ├── style.css
│   ├── layout.css
│   ├── components.css
│   ├── editor.css
│   └── documents.css
└── js/
    ├── app.js
    ├── state/
    ├── components/
    ├── utils/
    ├── workspace/
    ├── folder/
    ├── document/
    ├── editor/
    ├── mindmap/
    ├── wikipedia/
    ├── documents/
    ├── trash/
    ├── storage/
    └── auth/
```

## Data and Privacy

Workspace information is stored locally in the browser. Data persistence depends on the browser's local storage and IndexedDB, so clearing browser data may remove saved content. Export important workspace data regularly.

The login and signup pages are a frontend demonstration and do not provide secure, server-backed authentication.

## Limitations

- No backend server or database is configured.
- Authentication is frontend-only and is not suitable for protecting sensitive information.
- Wikipedia research requires an internet connection.
- Cross-device synchronization is not implemented.

## Future Improvements

- Add backend authentication and secure user accounts.
- Implement cloud synchronization and multi-device access.
- Add collaborative editing and real document sharing.
- Improve attachment export and backup functionality.

## License

This project is available under the MIT License. See the `LICENSE` file for details.