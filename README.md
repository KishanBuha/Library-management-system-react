`A ReactJS + NodeJS App for library book management which allows issuing, returning and viewing options of current books in the library.`

Open the project directory in a terminal,
Then cd to frontend and run "npm install" to install the dependencies.
Again then cd to backend directory and run "npm install", atlast run the command "npm run dev" to start the app.
Concurrently package is used for running backend and frontend simultaneously.
Frontend -> ReactJS.
Backend -> NodeJS with Mongoose.
The project uses MongoDB Database. Make sure you have MongoDB installed and running on your local machine.

The project will create the database and collections by itself, but all the initial student and books data has to be inserted directly.

Database -> library

Collections -> books - Books in the library
          students - Students related data
          borrows - Stores the student and corresponding issued books.

React Components -> Books -> List All the Books available
                    Issue -> Issue a book
                    Return -> List books issued by a student and option to return
                    Search -> List students who have issued a particular book
                    Nav -> Navbar