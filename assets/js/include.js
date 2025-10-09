// Include Header and Footer dynamically
document.addEventListener('DOMContentLoaded', function() {
    // Load Header
    const headerElement = document.getElementById('header');
    if (headerElement) {
        fetch('/partials/header.html')
            .then(response => response.text())
            .then(data => {
                headerElement.innerHTML = data;
                // Re-initialize header functionality after loading
                initHeaderFunctionality();
            })
            .catch(error => console.error('Error loading header:', error));
    }

    // Load Footer
    const footerElement = document.getElementById('footer');
    if (footerElement) {
        fetch('/partials/footer.html')
            .then(response => response.text())
            .then(data => {
                footerElement.innerHTML = data;
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});
