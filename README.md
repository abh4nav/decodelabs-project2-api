# Tasks API - DecodeLabs Project 2 (Backend API Development)

A small REST API built with Node.js and Express. Data is stored in memory.

## Run
```
npm install
npm start
```
Server starts at http://localhost:3000

## Endpoints
| Method | Route | Description | Success | Errors |
|---|---|---|---|---|
| GET | /tasks | List tasks (`?completed=true`, `?priority=high`) | 200 | - |
| GET | /tasks?search=word | Search tasks by title | 200 | - |
| GET | /tasks/:id | Get one task | 200 | 404 |
| POST | /tasks | Create a task | 201 | 400 |
| PUT | /tasks/:id | Update a task | 200 | 400, 404 |
| DELETE | /tasks/:id | Delete a task | 204 | 404 |

## Validation rules
- `title`: required, string, 3-100 characters
- `priority`: optional, one of `low`, `medium`, `high` (default `medium`)
- `completed`: optional, boolean

## Examples
```
curl http://localhost:3000/tasks

curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README","priority":"high"}'

curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

curl -X DELETE http://localhost:3000/tasks/2
```

Invalid request example (returns 400):
```
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"ab"}'
```
