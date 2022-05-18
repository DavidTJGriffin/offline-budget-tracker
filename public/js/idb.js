let db;

const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = function (event) {

    const db = event.target.result;

    db.createObjectStore('add_budget', { autoIncrement: true });
};


request.onsuccess = function (event) {

    db = event.target.result;


    if (navigator.onLine) {

        uploadTransaction();
    }
};

request.onerror = function (event) {

    console.log(event.target.errorCode);
};


function saveRecord(record) {
    console.log('save record function ocurred')

    const transaction = db.transaction(['add_budget'], 'readwrite');


    const budgetObjectStore = transaction.objectStore('add_budget');


    budgetObjectStore.add(record);
}


function uploadTransaction() {

    const transaction = db.transaction(['add_budget'], 'readwrite');


    const budgetObjectStore = transaction.objectStore('add_budget');


    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () {

        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['add_budget'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('add_budget');

                    budgetObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

}



window.addEventListener('online', uploadTransaction);