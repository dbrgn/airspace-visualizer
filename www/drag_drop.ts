export function initDragAndDrop(
    // The map element
    mapdiv: Element,
    // Dropzone
    dropzone: Element,
    // Info that is shown when dragging content over the map
    dropinfo: Element,
    // Function that actually loads the file contents.
    loadFile: (files: FileList) => void,
) {
    function onDragEnter() {
        dropzone.classList.add('droptarget');
        dropinfo.classList.remove('hidden');
    }

    function onDragOver(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function onDragLeave() {
        dropzone.classList.remove('droptarget');
        dropinfo.classList.add('hidden');
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        onDragLeave();

        if (e.dataTransfer.files) {
            loadFile(e.dataTransfer.files);
        }
    }

    mapdiv.addEventListener('dragenter', onDragEnter);
    mapdiv.addEventListener('dragover', onDragOver);
    mapdiv.addEventListener('dragleave', onDragLeave);
    mapdiv.addEventListener('drop', onDrop);
}
