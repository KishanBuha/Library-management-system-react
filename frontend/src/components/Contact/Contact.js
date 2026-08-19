import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-container">
            <h2>Contact Us</h2>
            <div className="contact-card">
                <p>If you have any queries, suggestions, or need help, feel free to reach out to us:</p>
                <p><strong>Email:</strong> <a href="mailto:support@librarysystem.com">support@librarysystem.com</a></p>
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p><strong>Address:</strong> Sabargam Library, Kadodara, Surat, India</p>
                <hr />
                <p>You can also visit our help desk during working hours: <strong>Mon–Fri, 10 AM – 5 PM.</strong></p>
            </div>
        </div>
    );
};

export default Contact;