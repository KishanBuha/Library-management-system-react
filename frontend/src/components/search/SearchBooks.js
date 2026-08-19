import React from 'react';
import '../Tables.css';

class SearchBooks extends React.Component {
    
    state = {
        header: null,
        books: []
    };

    fetchData = () => {
        var sem = document.getElementById('select').value;
        if (!sem) {
            this.setState({ books: [], header: null });
            return;
        };

        this.setState({
            header: <thead>
                <tr>
                    <th scope="col">Book Name</th>
                    <th scope="col">Author</th>
                    <th scope="col">Available Count</th>
                </tr>
            </thead>,
            books: []
        });

        fetch(`/api/getBooks/semester/${sem}`)
            .then(res => res.json())
            .then(bookData => {
                const bookRows = bookData.map(el => (
                    <tr key={el._id}>
                        <td>{el.name.toUpperCase()}</td>
                        <td>{el.author}</td>
                        <td>{el.count}</td>
                    </tr>
                ));
                this.setState({ books: bookRows });
            });
    }

    render() {
        return (
            <div>
                <div className="form-inline-group">
                    <h3>Search for Books by Semester</h3>
                    <select className="form-control" id="select" onChange={this.fetchData}>
                        <option value="">Select a Semester</option>
                        <option value="1">1st Sem</option>
                        <option value="2">2nd Sem</option>
                        <option value="3">3rd Sem</option>
                        <option value="4">4th Sem</option>
                        <option value="5">5th Sem</option>
                        <option value="6">6th Sem</option>
                        <option value="7">7th Sem</option>
                        <option value="8">8th Sem</option>
                    </select>
                </div>
                
                {this.state.header && 
                    <div className="table-container text-center">
                        {this.state.books.length > 0 ?
                            <table className="table table-hover">
                                {this.state.header}
                                <tbody>
                                    {this.state.books}
                                </tbody>
                            </table>
                            : <p>No books found for this semester.</p>
                        }
                    </div>
                }
            </div>
        );
    }
}

export default SearchBooks;