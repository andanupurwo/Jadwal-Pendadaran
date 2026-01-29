// Component: Table Renderer
export const renderTable = ({ headers, rows, sortColumn, sortDirection, onSort }) => {
    return `
        <div class="table-list-container">
            <table>
                <thead>
                    <tr>
                        ${headers.map(h => {
        const label = typeof h === 'object' ? h.label : h;
        const key = typeof h === 'object' ? h.key : null;
        const sortIcon = sortColumn === key ? (sortDirection === 'asc' ? '↑' : '↓') : '';
        const cursorStyle = key ? 'cursor:pointer; user-select:none;' : '';
        const widthStyle = typeof h === 'object' && h.width ? `width: ${h.width};` : '';
        const clickAttr = key ? `onclick="window.sortTable('${key}')"` : '';

        return `<th style="${cursorStyle} ${widthStyle}" ${clickAttr} title="${key ? 'Klik untuk urutkan' : ''}">${label} ${sortIcon}</th>`;
    }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.length > 0 ? rows.map(rowData => {
        const isComplex = !Array.isArray(rowData) && rowData.content;
        const cells = isComplex ? rowData.content : rowData;
        const rowStyle = isComplex && rowData.style ? `style="${rowData.style}"` : '';
        const rowClass = isComplex && rowData.className ? `class="${rowData.className}"` : '';

        return `
                            <tr ${rowClass} ${rowStyle}>
                                ${cells.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        `;
    }).join('') : `<tr><td colspan="${headers.length}" style="text-align:center; color:var(--text-muted); padding:2rem;">Tidak ada data yang cocok</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
};

// Component: Tab Item
export const renderTabItem = (id, label, activeTab, onClickAction) => `
    <div class="tab-item ${activeTab === id ? 'active' : ''}" onclick="${onClickAction}('${id}')">
        ${label}
    </div>
`;
