import React from 'react'

const form = () => {
const [name, setName] = React.useState('');
const [email, setEmail] = React.useState('');

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle form submission logic here
    console.log({ name, email });
};

return (
    <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="name">Name:</label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
            />
        </div>
        <div>
            <label htmlFor="email">Email:</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
        </div>
        <button type="submit">Submit</button>
    </form>
)
}

export default form
