var dropbox = []

document.getElementById("generateButton").onclick = () => {
    clearMarkdownText();
    var fileInputElement = document.getElementById("fileInput")

    if (dropbox.length === 0) {
        alert('Please choose a file')
        return
    }

    var uploadedFiles = dropbox
    var validated = true
    for (file of uploadedFiles) {
        if (!validateFileType) {
            validated = false
        }
    }

    if (validated) {
        const result = readFiles(uploadedFiles, processFile)
        console.log(result)
    }
}

function dropHandler(ev) {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
            if (item.kind === 'file') {
                const file = item.getAsFile()
                updateList(file)
            }
        });
    } else {
        [...ev.dataTransfer.files].forEach((file, i) => {

            updateList(file)
        });
    }

    dragOverLeaveHandler();
}

function dragOverHandler(ev) {
    document.getElementById('dropImage').style.opacity = 1;
    document.getElementById('drop_zone').style.borderColor = "black";
    ev.preventDefault();
}
function dragOverLeaveHandler(ev) {
    document.getElementById('dropImage').style.opacity = 0.5;
    document.getElementById('drop_zone').style.borderColor = "#1B85D2";
}

function clearFileList() {
    dropbox = []
    var fileInputElement = document.getElementById("fileInput")
    var fileListElement = document.getElementById("fileList")
    fileInputElement.value = ''
    fileListElement.innerHTML = ''
    document.getElementById("resetButton").style.visibility = 'hidden'
    document.getElementById("confirmation").style.visibility = 'hidden'
}

function handleFileInputOnChange() {
    var fileInputElement = document.getElementById("fileInput")
    var file = fileInputElement.files[fileInputElement.files.length - 1]
    updateList(file)
}

function updateList(file) {
    console.log(file)
    clearMarkdownText();
    dropbox.push(file)

    var fileListElement = document.getElementById("fileList")

    document.getElementById("resetButton").style.visibility = 'visible'

    fileListElement.innerHTML = ''

    for (file of dropbox) {
        var li = document.createElement("li");
        li.innerHTML = `${file.name} uploaded.`;
        li.className = 'file-list-item'
        fileListElement.appendChild(li);
    }
}

function markdownOnlyCopy() {
    let data = document.getElementById("markdown").value
    copy(data)
}

function markdownTextOnlyCopy() {
    let data = document.getElementById("markdownTextOnly").value
    copy(data)
}

function markdownCopyAllVersions() {
    let data = ''
    data = data.concat(document.getElementById("markdown").value)
    data = data.concat('\n')
    data = data.concat(document.getElementById("markdownTextOnly").value)
    copy(data)
}

function copy(data) {
    const clipboard = document.createElement('textarea')
    clipboard.value = data

    document.body.appendChild(clipboard)
    clipboard.focus()
    clipboard.select()
    try {
        document.execCommand('copy')
        document.getElementById("confirmation").style.visibility = 'visible'
        setTimeout(()=>{
            document.getElementById("confirmation").style.visibility = 'hidden'
        }, 3000)
    } catch (error) {
        alert('Unable to copy text.')
    } finally {
        document.body.removeChild(clipboard)
    }
}

function validateFileType(filePath) {
    var allowedFileExtensiosn = /(\.csv|\.txt)$/i;
    if (allowedFileExtensiosn.exec(filePath)) {
        return true
    } else {
        alert('Invalid file type')
        document.getElementById("fileInput").value = ''
        return false
    }
}

async function readFiles(uploadedFiles, callback) {
    const files = [...uploadedFiles].map(file => {
        const reader = new FileReader();
        return new Promise(resolve => {
            reader.onload = () => resolve(reader.result);
            reader.readAsText(file);
        });
    });
    const res = await Promise.all(files).then((readFiles) => {
        for (file of readFiles) {
            processFile(file)
        }
        addMarkdownHeading();
    });
}

function clearMarkdownText() {
    document.getElementById("markdown").value = ''
    document.getElementById("markdownTextOnly").value = ''
    document.getElementById("confirmation").style.visibility = 'hidden'
}

function addMarkdownHeading() {
    markdownFormatt(document.getElementById("markdown"))
    markdownFormatt(document.getElementById("markdownTextOnly"))
}

function processFile(data) {
    var json = csvToJSON(data)
    var markdown = generateMarkdown(json)
    var markdownTextOnly = generateMarkdownTextOnly(json)
    document.getElementById("markdown").value += markdown
    document.getElementById("markdownTextOnly").value += markdownTextOnly
}

function csvToJSON(str, delimiter = ",") {
    const csv = Papa.parse(str)

    var headers = csv.data[0]
    var rows = csv.data.splice(1)

    var result = []
    for (row of rows) {
        var dictionary = {}
        for (i in row) {
            var key = `${headers[i]}`
            var value = row[i]
            dictionary[key] = value
        }
        result.push(dictionary)
    }

    return result
}

function generateMarkdown(JSONArray) {
    var content = ""

    for (ticket of JSONArray) {
        if (ticket["Issue ID"] != undefined) {
            content = content.concat(`\n![${ticket["Issue ID"]}](${ticket["URL"]}): ${ticket["Title"]}`)
        }
    }

    return content
}

function markdownFormatt(element) {
    const data = element.value
    element.value = `\`\`\`${element.value}\n\`\`\``
}

function generateMarkdownTextOnly(JSONArray) {
    var contentTextOnly = ""

    for (ticket of JSONArray) {
        if (ticket["Issue ID"] != undefined) {
            contentTextOnly = contentTextOnly.concat(`\n- #${ticket["Issue ID"]} ${ticket["Title"]}`)
        }
    }
    return contentTextOnly
}

