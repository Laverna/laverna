function onMessage(evt) {
    const {data} = evt;
    self.postMessage(`hello response to ${data}`);
}

self.addEventListener('message', evt => onMessage(evt));

console.log('spawned a worker');
export default onMessage;
