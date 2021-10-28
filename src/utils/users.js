const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate data
    if (!username || !room) {
        return {
            error: 'Username and room must be provided'
        }
    }

    // Check name is unique for that room
    // Check for an existing user in this room with this username
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username already in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id )

    if (index !== -1) {
        return users.splice(index, 1)[0] // Remove user and return user object
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room.trim().toLowerCase())
}

addUser({
    id: 22,
    username: 'Andrew',
    room: 'General'
})

addUser({
    id: 42,
    username: 'Mike',
    room: 'General'
})

addUser({
    id: 42,
    username: 'Andrew',
    room: 'Central'
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
