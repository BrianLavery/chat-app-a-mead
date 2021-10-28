const socket = io()

// Elements ($ just means we know it's a DOM element - convention)
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin // offsetHeight doesn't include margin
    
    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Messages container height
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled (amount of distance scrolled from top); we add on visible height
    const scrollOffset = $messages.scrollTop + visibleHeight

    // We want to check if we were scrolled to the bottom just before last message added in
    if (containerHeight - newMessageHeight <= scrollOffset) {
        // We now set scroll top value to maximum amount
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, { 
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m a')
     })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, { 
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value // We second last value references the 'name' attribute
    
    // Emit - we provide event name, data (as many as want), then function to run as event acknowledgement
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled') // Re-enable submit button
        $messageFormInput.value = '' // Clear input
        $messageFormInput.focus() // Brings focus back to input
        
        if (error) {
            return console.log(error)
        }
            
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
    
    // If navigator geolocation exists then user can access it
    // If it does not exist they cannot share their location - so we use an if statement
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    
    $sendLocationButton.setAttribute('disabled', 'disabled') // disable button

    // getCurrentPosition is asynchronous but doesn't support the promise API
    // So we use a callback function that gets access to "position" object
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled') // re-enable button

            console.log('Location shared!')
        })
    }) 
})

// Final function is an acknowledgement
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/' // Redirects them to join
    }
})