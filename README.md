# Knowledge Workspace

Knowledge Workspace is a browser-based knowledge management application that helps users create, organize, edit, and connect their notes and documents. Users can manage workspaces, folders, and documents, use a block-based editor, search and organize information, and visualize relationships between knowledge through mind maps and knowledge graphs.

The application is built using HTML5, CSS3, and Vanilla JavaScript, with browser-based storage for persistent offline data.

## Features

- Create, edit, and delete workspaces, folders, and documents
- Block-based document editor
- Search and organize documents using tags and favorites
- Document linking and backlinks
- Interactive mind map and knowledge graph
- File and image attachments
- Import and export workspace data
- Trash and document recovery
- Offline data persistence using IndexedDB
- Responsive interface for desktop, tablet, and mobile
- Custom modals, notifications, animations, and interactive UI

## How Knowledge Workspace Works

1. Users create a workspace for a subject, project, or area of knowledge.
2. Folders are created to organize related documents.
3. Documents can be created and edited using the block-based editor.
4. Documents can be tagged and connected with other documents.
5. Relationships can be explored using backlinks, mind maps, and knowledge graphs.
6. Application data is automatically stored in the browser using IndexedDB.
7. Users can import, export, recover, and manage their knowledge.

## Project Structure

```text
knowledge-workspace/
├── assets/
│   ├── images/
│   └── icons/
├── css/
│   ├── style.css
│   ├── layout.css
│   └── components.css
├── js/
│   ├── components/
│   ├── document/
│   ├── folder/
│   ├── state/
│   ├── utils/
│   ├── workspace/
│   └── app.js
├── index.html
├── editor.html
└── README.md
Main Pages
index.html — workspace dashboard, folders, documents, search, and navigation.
editor.html — block-based document editing and knowledge management.
Project Proposal
Description

Knowledge Workspace is designed as a centralized environment for managing personal knowledge. It combines traditional folder-based organization with connected documents and visual knowledge representation.

Goals
Build a complete frontend knowledge-management application.
Demonstrate HTML, CSS, and JavaScript concepts covered in class.
Implement complete CRUD operations.
Provide persistent offline data storage.
Allow users to connect and visualize related information.
Create a responsive and interactive user experience.
Specifications

The application will provide:

Workspace, folder, and document CRUD operations
Block-based document editing
Search, tags, favorites, and recent documents
Document relationships and backlinks
Mind map and knowledge graph visualization
IndexedDB-based persistent storage
Import/export functionality
File attachments and trash/recovery
Responsive layouts for mobile, tablet, and desktop
Design

The interface follows a modern, visually rich design with strong typography, interactive cards, animations, custom SVG icons, responsive layouts, and clear navigation. The application uses native browser technologies instead of external JavaScript libraries.

Technologies Used
Technology	Purpose
HTML5	Application structure
CSS3	Styling, layouts, animations
Vanilla JavaScript	Application logic and CRUD
IndexedDB	Persistent data storage
LocalStorage	Lightweight browser storage
SVG	Icons and visual elements
Canvas / SVG	Knowledge visualization

No external JavaScript libraries or frameworks are used.

Prerequisites
Modern web browser
Visual Studio Code
Live Server extension or another local HTTP server
Git (optional)
Running the Application
1. Clone the repository
git clone <repository-url>
cd knowledge-workspace
2. Start a local server

Using VS Code, right-click index.html and select:

Open with Live Server

Alternatively, using Python:

python -m http.server 8000
3. Open the application

Visit:

http://localhost:8000
Data Storage

The application uses browser-based storage to persist user data.

IndexedDB is used for structured application data such as:

Workspaces
Folders
Documents
Blocks
Tags
Relationships

No external database server is required.

Technology Constraints

The project follows the prescribed Web Fundamentals technology requirements:

HTML
CSS
JavaScript

No external JavaScript frameworks or libraries are used.

Author

Ansh Singla

B.E. Computer Science & Engineering (AI & ML)
Chitkara University, Punjab

License

This project is licensed under the MIT License.


