# TaskMaster

This is a **backend project** built using **Express**, **PostgreSQL**, **TypeScript**, and **Zod**. It provides a robust and scalable API for user authentication and task management.

## Features

- **User Authentication**: Users can sign up and log in securely using validated credentials.
- **Task Management**: Authenticated users can:
  - Create tasks
  - Update existing tasks
  - Delete tasks

## Environment Variables

To run the project locally, create a `.env` file in the root directory with the following variables:

```env
DB_URI=your_database_connection_string_here
PORT=your_desired_port_here (e.g., 5000)
JWT_SECRET=your_jwt_secret_key_here
