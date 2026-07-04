let clients = [];

exports.addClient = (res) => {
    clients.push(res);
};

exports.removeClient = (res) => {
    clients = clients.filter(client => client !== res);
};

exports.sendNotificationToAll = (notification) => {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
};
