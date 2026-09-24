# 🤝 CholoShareKori

> **Community Resource Sharing Made Easy**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

*A peer-to-peer campus and localized community marketplace designed to reduce waste, support peers, and seamlessly trade essentials.*

---

## 📖 Table of Contents

* [About The Project](#-about-the-project)
* [System Architecture](#-system-architecture)
* [Feature Matrix](#-feature-matrix)
* [Transaction Lifecycle](#-transaction-lifecycle)
* [Core API Reference](#-core-api-reference)
* [Database Schema](#-database-schema)
* [Tech Stack](#-tech-stack)
* [Local Development](#-local-development)

---

## 📖 About The Project

**CholoShareKori** is a full-stack, transaction-based marketplace built to connect local communities and university campuses. Moving beyond standard e-commerce, it supports a comprehensive four-pillar resource sharing model: **Buy, Sell, Lend, and Borrow**. 

The platform is powered by a robust, state-driven transaction engine handling everything from immediate inventory reservation to dynamic JavaScript-based date math for calculating late-fee penalties on overdue borrowed items.

---

## 🏗️ System Architecture

The application operates on a containerized, decoupled architecture, separating the client interface, API gateway, and relational data storage.

```mermaid
flowchart LR
    Client(["Client Browser"]) <-->|"REST API / JSON"| Frontend["Frontend: React.js (Localhost)"]
    
    subgraph Docker ["Docker Environment"]
        API["Backend: Node/Express API"]
        DB[("MySQL Database")]
    end

    Frontend <-->|"HTTP Requests"| API
    API <-->|"SQL Queries"| DB

    style Frontend fill:#0f172a,stroke:#61DAFB,stroke-width:2px,color:#fff
    style API fill:#339933,stroke:#fff,stroke-width:2px,color:#fff
    style DB fill:#005C84,stroke:#fff,stroke-width:2px,color:#fff

