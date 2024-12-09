function getElementById(id) {
    var e = document.getElementById(id);
    if (e === null) {
        throw new Error("Element with id ".concat(id, " not found"));
    }
    return e;
}
var titleInput = getElementById("title-input");
var textInput = getElementById("text-input");
var saveButton = getElementById("save-button");
var newButton = getElementById("new-button");
var savedNotes = getElementById("notes");
// When the user opens the page we render saved notes.
// Each saved note has an event listener for click
// When we click it, it will fill the editor context
// with the note content and NOT remove the note from the
// saved notes list. It will automatically saved the note
// Every 2 seconds, so we don't have to worry about losing
// the note content. We can always click the delete button
// to remove a note, whether or not it's currently in context.
// So each note will have a UUID, and we can use that to
// identify the note in the saved notes list and remove it
var Note = /** @class */ (function () {
    function Note(title, text, timestamp, uuid) {
        this.title = title;
        this.text = text;
        this.timestamp = timestamp;
        this.uuid = uuid;
    }
    return Note;
}());
var notes = [];
var currentContext;
function initalizer() {
    currentContext = new Note("", "", Date.now(), crypto.randomUUID());
    var rawSavedNotes = localStorage.getItem("notes");
    if (rawSavedNotes !== null) {
        notes = JSON.parse(rawSavedNotes);
    }
}
initalizer();
function renderNotes() {
    savedNotes.innerHTML = "";
    notes.forEach(function (note) {
        var noteElement = document.createElement("div");
        noteElement.classList.add("note-element");
        var dateString = new Date(note.timestamp).toLocaleDateString();
        noteElement.innerHTML = "\n      <h3>".concat(note.title.length > 20 ? note.title.slice(0, 20) + "..." : note.title, "</h3>\n      <p class=\"saved-note-body\">").concat(note.text.length > 25 ? note.text.slice(0, 25) + "..." : note.text, "</p>\n      <p>").concat(dateString, "</p>\n      <button class=\"delete-button\">Delete</button>\n    ");
        noteElement.addEventListener("click", function () {
            if (currentContext.title !== "") {
                saveContext();
            }
            currentContext = note;
            displayContext();
        });
        noteElement
            .querySelector(".delete-button")
            .addEventListener("click", function (event) {
            notes.splice(notes.indexOf(note), 1);
            localStorage.setItem("notes", JSON.stringify(notes));
            noteElement.remove();
        });
        getElementById("notes").appendChild(noteElement);
    });
}
function saveContext() {
    dbg("Context saved initiated");
    currentContext.title = titleInput.value;
    currentContext.text = textInput.value;
    if (currentContext.title.trim() === "") {
        dbg("No title");
        return;
    }
    var note = notes.filter(function (n) { return n.uuid === currentContext.uuid; });
    // Update the note if it exists
    if (note.length === 1) {
        dbg("Found note");
        note[0].title = titleInput.value;
        note[0].text = textInput.value;
        dbg("Updated note");
    }
    else {
        dbg("No note found, updating context");
        // Update & add the current note context, if it isn't already saved
        currentContext.title = titleInput.value;
        currentContext.text = textInput.value;
        notes.push(currentContext);
        renderNotes();
        updateStorage();
        dbg("Updated context & added note, rerendered");
    }
    // Render the notes list with new data
}
function updateStorage() {
    localStorage.clear();
    localStorage.setItem("notes", JSON.stringify(notes));
}
function displayContext() {
    titleInput.value = currentContext.title;
    textInput.value = currentContext.text;
}
saveButton.addEventListener("click", saveContext);
newButton.addEventListener("click", function () {
    saveContext();
    currentContext = new Note("", "", Date.now(), crypto.randomUUID());
    displayContext();
});
// Load notes on page load
renderNotes();
function dbg(text) {
    console.log(text);
}
