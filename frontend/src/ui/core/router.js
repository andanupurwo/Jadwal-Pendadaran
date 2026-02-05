import { appState } from '../../data/store.js';
import * as views from '../pages/index.js';

export function navigate(page) {
    const mainContent = document.getElementById('main-content');
    const navItems = document.querySelectorAll('.nav-item');

    appState.currentView = page;

    // Reset searching, sorting, and filters when navigating
    if (appState.currentView !== page) {
        appState.sortColumn = null;
        appState.sortDirection = 'asc';
        appState.searchTerm = '';
        appState.selectedProdiFilter = '';
        appState.selectedStatusFilter = '';
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
