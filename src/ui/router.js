import { appState } from '../data/store.js';
import * as views from './pages/index.js';

export function navigate(page) {
    const mainContent = document.getElementById('main-content');
    const navItems = document.querySelectorAll('.nav-item');

    appState.currentView = page;

    // Reset searching and sorting when navigating away from dosen page
    if (page !== 'dosen') {
        appState.sortColumn = null;
        appState.sortDirection = 'asc';
        appState.searchTerm = '';
    }

    // Update Active Link UI
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Render View
    if (views[page]) {
        mainContent.innerHTML = views[page]();
        window.scrollTo(0, 0);
    }
}
