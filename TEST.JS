function handleDeleteNote() {
		const id = url.searchParams.get('id');
		console.log("🚀 ~ handleDeleteNote ~ id:", id)
	const confirmed = confirm('Are you sure you want to delete this note?');
	if (confirmed) {
		fetch(`lib/server/notes`, {
			method: 'DELETE'
		})
			.then((res) => {
				if (res.ok) {
					goto('/notes');
				} else {
					alert('Failed to delete the note');
				}
			})
			.catch((err) => {
				console.error(err);
				alert('Failed to delete the note');
			});
	}
}
