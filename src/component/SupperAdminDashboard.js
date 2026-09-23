

// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// const USERS_ENDPOINT = `${API_BASE}/users`;
// const REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;

// // ================================================================
// // ========== PRODUCT INVENTORY & REQUEST REPORT ==================
// // ==========  (Super Admin ONLY)  ================================
// // ================================================================
// const ProductInventoryReport = () => {
//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showDepartmentUsage, setShowDepartmentUsage] = useState(false);
//   const [departmentUsage, setDepartmentUsage] = useState({});
//   const [expandedDept, setExpandedDept] = useState(null);

//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [stockFilter, setStockFilter] = useState('ALL');
//   const [deptFilter, setDeptFilter] = useState('ALL');
//   const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
//   const [quarterFilter, setQuarterFilter] = useState('ALL');

//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const REFRESH_INTERVAL = 15000;

//   useEffect(() => { fetchData(); }, []);

//   useEffect(() => {
//     if (!autoRefresh) return;
//     const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
//     return () => clearInterval(id);
//   }, [autoRefresh]);

//   const fetchData = async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);
//       setError('');
//       const [productRes, requestRes] = await Promise.all([
//         fetch(PRODUCTS_ENDPOINT),
//         fetch(REQUESTS_ENDPOINT),
//       ]);

//       if (!productRes.ok || !requestRes.ok) {
//         throw new Error('Failed to fetch data from API');
//       }

//       const productsData = await productRes.json();
//       const requestsData = await requestRes.json();

//       setRequests(requestsData);

//       const requestMap = new Map();
//       requestsData.forEach(req => {
//         if (req.product && req.product.productId) {
//           requestMap.set(req.product.productId, req);
//         }
//       });

//       const mergedData = productsData.map(prod => {
//         const req = requestMap.get(prod.productId);
//         const requestStatus = req?.status ?? 'AVAILABLE';

//         const stockStatus =
//           requestStatus === 'APPROVED'
//             ? 'Out of Stock'
//             : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

//         return {
//           ...prod,
//           quantity: req?.quantity ?? '-',
//           adminNote: req?.adminNote ?? '-',
//           description: req?.description ?? '-',
//           status: requestStatus,
//           departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
//           productDescription: prod.productDescription ?? '-',
//           stockStatus,
//           requestedProductName: req?.product?.productName ?? '-',
//         };
//       });

//       setProducts(mergedData);
//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error(err);
//       if (!silent) setError('Failed to load data.');
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   const getQuarter = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return Math.floor(d.getMonth() / 3) + 1;
//   };
//   const getYear = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getFullYear();
//   };
//   const getFilterDate = (item) => item.receiptDate || item.issueDate || null;

//   // Current year + previous 5
//   const years = useMemo(() => {
//     const currentYear = new Date().getFullYear();
//     return Array.from({ length: 6 }, (_, i) => currentYear - i);
//   }, []);

//   const matchesPeriod = (item) => {
//     const d = getFilterDate(item);
//     if (!d) return yearFilter === 'ALL' && quarterFilter === 'ALL';
//     if (yearFilter !== 'ALL' && getYear(d) !== Number(yearFilter)) return false;
//     if (quarterFilter !== 'ALL' && getQuarter(d) !== Number(quarterFilter)) return false;
//     return true;
//   };

//   const periodProducts = useMemo(
//     () => products.filter(matchesPeriod),
//     [products, yearFilter, quarterFilter]
//   );

//   const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
//   const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

//   const departments = useMemo(() => {
//     const set = new Set(periodProducts.map(p => p.departmentName).filter(Boolean));
//     return Array.from(set).sort();
//   }, [periodProducts]);

//   const filteredProducts = useMemo(() => {
//     return periodProducts.filter(p => {
//       const searchMatch =
//         !search ||
//         (p.productName || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.productDescription || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.departmentName || '').toLowerCase().includes(search.toLowerCase());

//       const statusMatch = statusFilter === 'ALL' || p.status === statusFilter;
//       const stockMatch = stockFilter === 'ALL' || p.stockStatus === stockFilter;
//       const deptMatch = deptFilter === 'ALL' || p.departmentName === deptFilter;

//       return searchMatch && statusMatch && stockMatch && deptMatch;
//     });
//   }, [periodProducts, search, statusFilter, stockFilter, deptFilter]);

//   useEffect(() => {
//     const deptDetails = {};
//     requests.forEach(req => {
//       if (req.status !== 'APPROVED' && req.status !== 'REJECTED') return;
//       const linkedProduct = products.find(p => p.productId === req?.product?.productId);
//       const dateStr =
//         req.receiptDate ||
//         req.issueDate ||
//         linkedProduct?.receiptDate ||
//         linkedProduct?.issueDate;

//       const y = getYear(dateStr);
//       const q = getQuarter(dateStr);

//       if (yearFilter !== 'ALL' && y !== Number(yearFilter)) return;
//       if (quarterFilter !== 'ALL' && q !== Number(quarterFilter)) return;

//       const dept = req.departmentName || 'Unknown';
//       const productName = req?.product?.productName ?? '-';
//       const qty = Number(req.quantity) || 0;
//       if (!deptDetails[dept]) deptDetails[dept] = [];
//       deptDetails[dept].push({ productName, qty, status: req.status });
//     });
//     setDepartmentUsage(deptDetails);
//   }, [requests, products, yearFilter, quarterFilter]);

//   const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(1);
//   }, [totalPages, currentPage]);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filteredProducts.slice(start, start + pageSize);
//   }, [filteredProducts, currentPage, pageSize]);

//   const exportToPDF = () => {
//     const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const marginLeft = 40;
//     const marginRight = 40;
//     const tableWidth = pageWidth - marginLeft - marginRight;

//     doc.setFontSize(16);
//     doc.setTextColor(15, 23, 42);
//     doc.text('Product Inventory & Request Report', marginLeft, 40);

//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

//     const periodText =
//       yearFilter === 'ALL' && quarterFilter === 'ALL'
//         ? 'All Time'
//         : `${yearFilter === 'ALL' ? 'All Years' : yearFilter} — ${
//             quarterFilter === 'ALL' ? 'All Quarters' : `Q${quarterFilter}`
//           }`;
//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`Report Period: ${periodText}`, marginLeft, 70);
//     doc.setFont('helvetica', 'normal');

//     const filterSummary = [];
//     if (search) filterSummary.push(`Search: "${search}"`);
//     if (statusFilter !== 'ALL') filterSummary.push(`Admin Status: ${statusFilter}`);
//     if (stockFilter !== 'ALL') filterSummary.push(`Stock: ${stockFilter}`);
//     if (deptFilter !== 'ALL') filterSummary.push(`Department: ${deptFilter}`);

//     let y = 84;
//     if (filterSummary.length > 0) {
//       doc.setTextColor(100);
//       doc.text(`Filters: ${filterSummary.join('  |  ')}`, marginLeft, y);
//       y += 12;
//     }

//     const cardY = y + 4;
//     const cardHeight = 34;
//     const cardGap = 10;
//     const cardWidth = (tableWidth - cardGap * 2) / 3;

//     doc.setFillColor(220, 252, 231);
//     doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(22, 101, 52);
//     doc.setFontSize(9);
//     doc.text('In Stock', marginLeft + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(254, 226, 226);
//     doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(185, 28, 28);
//     doc.setFontSize(9);
//     doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(219, 234, 254);
//     doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(30, 64, 175);
//     doc.setFontSize(9);
//     doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(filteredProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     y = cardY + cardHeight + 20;

//     const deptKeys = Object.keys(departmentUsage);
//     if (deptKeys.length > 0) {
//       doc.setFontSize(12);
//       doc.setTextColor(30, 64, 175);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Department-wise Usage (Approved / Rejected)', marginLeft, y);
//       doc.setFont('helvetica', 'normal');
//       y += 10;

//       const body = [];
//       deptKeys.forEach(dept => {
//         const items = departmentUsage[dept];
//         const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//         const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

//         body.push([
//           {
//             content: dept,
//             rowSpan: items.length + 1,
//             styles: {
//               valign: 'middle', halign: 'left', fontStyle: 'bold',
//               textColor: [15, 23, 42], fillColor: [241, 245, 249]
//             }
//           },
//           { content: `Total Requests: ${items.length}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [30, 64, 175], fillColor: [219, 234, 254] } },
//           { content: `Approved: ${approvedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [22, 101, 52], fillColor: [220, 252, 231] } },
//           { content: `Rejected: ${rejectedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }
//         ]);

//         items.forEach(item => {
//           body.push([
//             { content: item.productName, styles: { halign: 'left' } },
//             { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
//             {
//               content: item.status,
//               styles: {
//                 halign: 'center', fontStyle: 'bold',
//                 textColor: item.status === 'APPROVED' ? [22, 101, 52] : [185, 28, 28],
//                 fillColor: item.status === 'APPROVED' ? [240, 253, 244] : [254, 242, 242]
//               }
//             }
//           ]);
//         });
//       });

//       autoTable(doc, {
//         startY: y + 4,
//         head: [['Department', 'Product Name', 'Quantity', 'Status']],
//         body,
//         theme: 'grid',
//         styles: { fontSize: 9, cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, overflow: 'linebreak', valign: 'middle', lineColor: [203, 213, 225], lineWidth: 0.5, textColor: [30, 41, 59] },
//         headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
//         bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
//         tableWidth: tableWidth,
//         columnStyles: {
//           0: { cellWidth: 160, halign: 'left' },
//           1: { cellWidth: 'auto', halign: 'left' },
//           2: { cellWidth: 100, halign: 'center' },
//           3: { cellWidth: 100, halign: 'center' }
//         },
//         margin: { left: marginLeft, right: marginRight }
//       });

//       y = doc.lastAutoTable.finalY + 24;
//     }

//     doc.setFontSize(12);
//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Product Details', marginLeft, y);
//     doc.setFont('helvetica', 'normal');
//     y += 10;

//     autoTable(doc, {
//       startY: y + 4,
//       tableWidth: tableWidth,
//       theme: 'grid',
//       head: [[
//         'Product Name', 'Description', 'Qty', 'Department', 'Price',
//         'Receipt Date', 'Issue Date', 'Staff Description', 'Admin Note',
//         'Admin Status', 'Stock Status'
//       ]],
//       body: filteredProducts.map(p => [
//         p.productName ?? '-',
//         p.productDescription ?? '-',
//         { content: p.quantity ?? '-', styles: { halign: 'center' } },
//         p.departmentName ?? '-',
//         { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
//         { content: p.issueDate ?? '-', styles: { halign: 'center' } },
//         p.description ?? '-',
//         p.adminNote ?? '-',
//         p.status ?? '-',
//         p.stockStatus ?? '-'
//       ]),
//       styles: { fontSize: 8, cellPadding: { top: 5, right: 6, bottom: 5, left: 6 }, overflow: 'linebreak', valign: 'middle', lineColor: [226, 232, 240], lineWidth: 0.5, textColor: [30, 41, 59] },
//       headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', halign: 'center', valign: 'middle', fontSize: 8 },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       columnStyles: {
//         0: { cellWidth: 75, halign: 'left', fontStyle: 'bold' },
//         1: { cellWidth: 105, halign: 'left' },
//         2: { cellWidth: 35, halign: 'center' },
//         3: { cellWidth: 75, halign: 'left' },
//         4: { cellWidth: 50, halign: 'right' },
//         5: { cellWidth: 65, halign: 'center' },
//         6: { cellWidth: 65, halign: 'center' },
//         7: { cellWidth: 95, halign: 'left' },
//         8: { cellWidth: 95, halign: 'left' },
//         9: { cellWidth: 70, halign: 'center' },
//         10: { cellWidth: 60, halign: 'center' }
//       },
//       margin: { left: marginLeft, right: marginRight },
//       didParseCell: (data) => {
//         if (data.section === 'body') {
//           if (data.column.index === 9) {
//             const v = data.cell.raw;
//             if (v === 'APPROVED') { data.cell.styles.textColor = [22, 101, 52]; data.cell.styles.fillColor = [240, 253, 244]; data.cell.styles.fontStyle = 'bold'; }
//             else if (v === 'REJECTED') { data.cell.styles.textColor = [185, 28, 28]; data.cell.styles.fillColor = [254, 242, 242]; data.cell.styles.fontStyle = 'bold'; }
//             else if (v === 'PENDING') { data.cell.styles.textColor = [146, 64, 14]; data.cell.styles.fillColor = [255, 251, 235]; data.cell.styles.fontStyle = 'bold'; }
//           }
//           if (data.column.index === 10) {
//             const v = data.cell.raw;
//             if (v === 'In Stock') { data.cell.styles.textColor = [22, 101, 52]; data.cell.styles.fontStyle = 'bold'; }
//             else if (v === 'Out of Stock') { data.cell.styles.textColor = [185, 28, 28]; data.cell.styles.fontStyle = 'bold'; }
//           }
//         }
//       }
//     });

//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.setTextColor(120);
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.text(`Product Inventory & Request Report — ${periodText}`, marginLeft, pageHeight - 20);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
//     }

//     const periodTag =
//       (yearFilter === 'ALL' ? 'AllYears' : yearFilter) + '_' +
//       (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter);
//     doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   const toggleDept = (dept) => setExpandedDept(expandedDept === dept ? null : dept);

//   const badgeStyle = (status) => {
//     const map = {
//       APPROVED: { bg: '#dcfce7', color: '#166534' },
//       REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
//       PENDING: { bg: '#fef3c7', color: '#92400e' },
//       AVAILABLE: { bg: '#dbeafe', color: '#1e40af' },
//     };
//     const c = map[status] || { bg: '#e2e8f0', color: '#334155' };
//     return { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: c.bg, color: c.color };
//   };

//   return (
//     <div>
//       {/* Top bar */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
//         <button
//           style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//           onClick={() => setShowDepartmentUsage(!showDepartmentUsage)}
//         >
//           {showDepartmentUsage ? 'Hide' : 'Show'} Department Usage
//         </button>

//         <button
//           onClick={exportToPDF}
//           style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//         >
//           Export to PDF
//         </button>

//         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
//           <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
//           Auto-refresh (15s)
//         </label>

//         {lastUpdated && (
//           <span style={{ fontSize: '12px', color: '#64748b' }}>
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//       </div>

//       {/* Period filter */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
//         <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>Report Period:</strong>
//         <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Years</option>
//           {years.map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//         <select value={quarterFilter} onChange={(e) => { setQuarterFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Quarters</option>
//           <option value="1">Q1 (Jan – Mar)</option>
//           <option value="2">Q2 (Apr – Jun)</option>
//           <option value="3">Q3 (Jul – Sep)</option>
//           <option value="4">Q4 (Oct – Dec)</option>
//         </select>
//         <button
//           onClick={() => { setYearFilter(String(new Date().getFullYear())); setQuarterFilter('ALL'); setCurrentPage(1); }}
//           style={{ padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
//         >
//           This Year
//         </button>
//       </div>

//       {/* Department usage panel */}
//       {showDepartmentUsage && (
//         <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0f4f8', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
//           <h3 style={{ marginTop: 0 }}>Department-wise Usage (Approved / Rejected)</h3>
//           {Object.keys(departmentUsage).length === 0 ? (
//             <p style={{ color: '#64748b' }}>No approved or rejected requests for this period.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {Object.keys(departmentUsage).map((dept) => {
//                 const items = departmentUsage[dept];
//                 const isOpen = expandedDept === dept;
//                 const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//                 const rejectedCount = items.filter(i => i.status === 'REJECTED').length;
//                 return (
//                   <div key={dept} style={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
//                     <div onClick={() => toggleDept(dept)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', backgroundColor: isOpen ? '#e0e7ff' : '#f8fafc' }}>
//                       <span style={{ fontWeight: '600', color: '#1e293b' }}>{dept}</span>
//                       <span style={{ fontSize: '13px', color: '#64748b' }}>
//                         {items.length} request{items.length !== 1 ? 's' : ''}
//                         <span style={{ marginLeft: '10px', color: '#166534', fontWeight: 600 }}> {approvedCount}</span>
//                         <span style={{ marginLeft: '8px', color: '#b91c1c', fontWeight: 600 }}> {rejectedCount}</span>
//                         <span style={{ marginLeft: '10px' }}>{isOpen ? '▲' : '▼'}</span>
//                       </span>
//                     </div>
//                     {isOpen && (
//                       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                         <thead>
//                           <tr>
//                             <th style={deptThStyle}>Product Name</th>
//                             <th style={deptThStyle}>Quantity</th>
//                             <th style={deptThStyle}>Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {items.map((item, i) => (
//                             <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
//                               <td style={deptTdStyle}>{item.productName}</td>
//                               <td style={{ ...deptTdStyle, fontWeight: '600' }}>{item.qty}</td>
//                               <td style={deptTdStyle}><span style={badgeStyle(item.status)}>{item.status}</span></td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Stock cards */}
//       <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
//         <div style={{ flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//           <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
//           <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
//         </div>
//         <div style={{ flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//           <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
//           <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
//         </div>
//       </div>

//       {/* Filter bar */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
//         <input
//           type="text"
//           placeholder="Search product / description / department..."
//           value={search}
//           onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
//           style={{ flex: '1 1 240px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
//         />
//         <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Admin Status</option>
//           <option value="APPROVED">APPROVED</option>
//           <option value="REJECTED">REJECTED</option>
//           <option value="PENDING">PENDING</option>
//           <option value="AVAILABLE">AVAILABLE</option>
//         </select>
//         <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Stock Status</option>
//           <option value="In Stock">In Stock</option>
//           <option value="Out of Stock">Out of Stock</option>
//         </select>
//         <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Departments</option>
//           {departments.map(d => <option key={d} value={d}>{d}</option>)}
//         </select>
//         <button
//           onClick={() => { setSearch(''); setStatusFilter('ALL'); setStockFilter('ALL'); setDeptFilter('ALL'); setCurrentPage(1); }}
//           style={{ padding: '8px 14px', backgroundColor: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
//         >
//           Clear
//         </button>
//       </div>

//       {/* Table */}
//       {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
//         <>
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
//               <thead>
//                 <tr>
//                   <th style={headerStyle}>Product Name</th>
//                   <th style={headerStyle}>Product Description</th>
//                   <th style={headerStyle}>Quantity</th>
//                   <th style={headerStyle}>Department</th>
//                   <th style={headerStyle}>Price</th>
//                   <th style={headerStyle}>Receipt Date</th>
//                   <th style={headerStyle}>Issue Date</th>
//                   <th style={headerStyle}>Staff Description</th>
//                   <th style={headerStyle}>Admin Note</th>
//                   <th style={headerStyle}>Admin Status</th>
//                   <th style={headerStyle}>Stock Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedProducts.length === 0 ? (
//                   <tr><td colSpan="11" style={{ padding: '20px', textAlign: 'center' }}>No products match your filters.</td></tr>
//                 ) : (
//                   paginatedProducts.map((p) => (
//                     <tr key={p.productId} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                       <td style={cellStyle}>{p.productName || '-'}</td>
//                       <td style={cellStyle}>{p.productDescription ?? '-'}</td>
//                       <td style={cellStyle}>{p.quantity ?? '-'}</td>
//                       <td style={cellStyle}>{p.departmentName}</td>
//                       <td style={cellStyle}>{p.price != null ? Number(p.price).toLocaleString() : '-'}</td>
//                       <td style={cellStyle}>{p.receiptDate ?? '-'}</td>
//                       <td style={cellStyle}>{p.issueDate ?? '-'}</td>
//                       <td style={cellStyle}>{p.description ?? '-'}</td>
//                       <td style={cellStyle}>{p.adminNote ?? '-'}</td>
//                       <td style={cellStyle}><span style={badgeStyle(p.status)}>{p.status ?? 'AVAILABLE'}</span></td>
//                       <td style={{ ...cellStyle, fontWeight: 'bold', color: p.stockStatus === 'In Stock' ? '#166534' : '#b91c1c' }}>{p.stockStatus}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '15px', fontSize: '13px', color: '#475569' }}>
//             <div>
//               Showing <strong>{filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> – <strong>{Math.min(currentPage * pageSize, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> results
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <label>Rows:
//                 <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={{ marginLeft: '6px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                 </select>
//               </label>
//               <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={pageBtnStyle(currentPage === 1)}>Prev</button>
//               <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
//               <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={pageBtnStyle(currentPage === totalPages)}>Next</button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// // ================================================================
// // ==================== SUPER ADMIN DASHBOARD =====================
// // ================================================================
// const SuperAdminDashboard = () => {
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');
//   const [reportKind, setReportKind] = useState('products');

//   const [showInventoryReport, setShowInventoryReport] = useState(false);

//   const generateProductsPdf = (products) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('All Products Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Name', dataKey: 'name' },
//       { header: 'Description', dataKey: 'description' },
//       { header: 'Quantity', dataKey: 'quantity' },
//       { header: 'Unit Price', dataKey: 'unitPrice' },
//       { header: 'Supplier', dataKey: 'supplier' },
//       { header: 'Receipt Date', dataKey: 'receiptDate' },
//       { header: 'Issue Date', dataKey: 'issueDate' },
//     ];
//     const rows = products.map((p) => ({
//       id: p.productId ?? '', name: p.productName ?? '', description: p.productDescription ?? '',
//       quantity: p.productQuantity ?? '', unitPrice: p.price ?? '', supplier: p.supplierName ?? '',
//       receiptDate: p.receiptDate ?? '', issueDate: p.issueDate ?? '',
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`products-report-${Date.now()}.pdf`);
//   };

//   const generateProductsExcel = (products) => {
//     const data = products.map((p) => ({
//       ID: p.productId ?? '', Name: p.productName ?? '', Description: p.productDescription ?? '',
//       Quantity: p.productQuantity ?? '', 'Unit Price': p.price ?? '', Supplier: p.supplierName ?? '',
//       'Receipt Date': p.receiptDate ?? '', 'Issue Date': p.issueDate ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
//   };

//   const generateUsersPdf = (userList) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('System Users Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Username', dataKey: 'username' },
//       { header: 'Email', dataKey: 'email' },
//       { header: 'Gender', dataKey: 'gender' },
//       { header: 'Phone', dataKey: 'phone' },
//       { header: 'Role', dataKey: 'role' },
//       { header: 'Department', dataKey: 'department' },
//     ];
//     const rows = userList.map((u) => ({
//       id: u.userId ?? u.id ?? '', username: u.userName ?? u.username ?? u.name ?? '',
//       email: u.email ?? '', gender: u.gender ?? '', phone: u.phoneNumber ?? u.phone ?? '',
//       role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [245, 243, 255] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`users-report-${Date.now()}.pdf`);
//   };

//   const generateUsersExcel = (userList) => {
//     const data = userList.map((u) => ({
//       ID: u.userId ?? u.id ?? '', Username: u.userName ?? u.username ?? u.name ?? '',
//       Email: u.email ?? '', Gender: u.gender ?? '', Phone: u.phoneNumber ?? u.phone ?? '',
//       Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       Department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 20 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
//     XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
//   };

//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');
//     try {
//       const isUsers = reportKind === 'users';
//       const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
//       const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } });

//       if (!response.ok) {
//         let errorMsg = `Server responded with ${response.status}`;
//         try { const errText = await response.text(); if (errText) errorMsg = errText; } catch (_) {}
//         throw new Error(errorMsg);
//       }

//       const data = await response.json();
//       if (!Array.isArray(data) || data.length === 0) throw new Error('No data available to export.');

//       if (isUsers) {
//         if (type === 'pdf') generateUsersPdf(data); else generateUsersExcel(data);
//       } else {
//         if (type === 'pdf') generateProductsPdf(data); else generateProductsExcel(data);
//       }
//       setShowReportOptions(false);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       setReportError(
//         error.message === 'Failed to fetch'
//           ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
//           : error.message
//       );
//     } finally {
//       setDownloadingType(null);
//     }
//   };

//   // ============ DASHBOARD CARDS ============
//   const cards = [
//     {
//       title: 'All Products Report',
//       icon: '📦',
//       description: 'Download a full report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
//     },
//     {
//       title: 'System Users',
//       icon: '👥',
//       description: 'Download a report of all registered users across every department.',
//       color: '#8b5cf6',
//       actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
//     },
//     // ===== SUPER ADMIN ONLY =====
//     {
//       title: 'Product Inventory & Request Report',
//       icon: '📊',
//       description: 'View stock status, department usage, and export a full PDF report.',
//       color: '#0ea5e9',
//       actions: [{ label: 'Open Inventory Report', type: 'inventory' }],
//     },
//   ];

//   const handleAction = (action) => {
//     if (action.type === 'report') {
//       setReportError('');
//       setReportKind(action.kind || 'products');
//       setShowReportOptions(true);
//     } else if (action.type === 'inventory') {
//       setShowInventoryReport(true);
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   const modalOverlay = {
//     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
//     alignItems: 'center', justifyContent: 'center', zIndex: 1000,
//   };
//   const modalContent = {
//     backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
//     maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//   };
//   const closeButton = {
//     marginTop: '20px', padding: '10px 24px', border: 'none', borderRadius: '7px',
//     backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '14px',
//     fontWeight: '600', cursor: 'pointer',
//   };

//   const isUsersReport = reportKind === 'users';
//   const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
//   const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

//   return (
//     <div style={{ padding: '30px' }}>
//       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
//         Welcome, Super Admin — Full System Control
//       </p>

//       {/* Dashboard Cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
//         {cards.map((card) => (
//           <div
//             key={card.title}
//             style={{
//               backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
//               border: '1px solid #e2e8f0', borderLeft: `5px solid ${card.color}`,
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease',
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'; }}
//             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
//           >
//             <div style={{ width: '55px', height: '55px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '18px' }}>
//               {card.icon}
//             </div>
//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>{card.title}</h2>
//             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.description}</p>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{ width: '100%', padding: '11px 15px', border: 'none', borderRadius: '7px', backgroundColor: card.color, color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
//                 >
//                   {action.label} →
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ============ EMBEDDED INVENTORY REPORT (SUPER ADMIN ONLY) ============ */}
//       {showInventoryReport && (
//         <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//             <h2 style={{ margin: 0, color: '#0f172a' }}>Product Inventory & Request Report</h2>
//             <button
//               onClick={() => setShowInventoryReport(false)}
//               style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
//             >
//               Close ✕
//             </button>
//           </div>
//           <ProductInventoryReport />
//         </div>
//       )}

//       {/* ============ REPORT OPTIONS MODAL ============ */}
//       {showReportOptions && (
//         <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose the format you want to download:</p>

//             {reportError && (
//               <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'pdf' ? '#f87171' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'excel' ? '#4ade80' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
//                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
//               </button>
//             </div>

//             <div style={{ textAlign: 'right' }}>
//               <button style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }} onClick={() => setShowReportOptions(false)} disabled={!!downloadingType}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Shared styles
// const headerStyle = { padding: '10px', backgroundColor: '#1e40af', color: '#fff', textAlign: 'left', fontSize: '13px' };
// const cellStyle = { padding: '10px', fontSize: '13px' };
// const selectStyle = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' };
// const deptThStyle = { padding: '8px 16px', textAlign: 'left', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
// const deptTdStyle = { padding: '10px 16px', fontSize: '13px', color: '#1e293b' };
// const pageBtnStyle = (disabled) => ({
//   padding: '6px 12px',
//   backgroundColor: disabled ? '#e2e8f0' : '#3b82f6',
//   color: disabled ? '#94a3b8' : '#fff',
//   border: 'none', borderRadius: '4px',
//   cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px'
// });

// export default SuperAdminDashboard;
import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Use relative URLs so the dev-server proxy forwards them (no CORS)
const API_BASE = '/api';

const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
const USERS_ENDPOINT = `${API_BASE}/users`;
const REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;

// ================================================================
// ========== PRODUCT INVENTORY & REQUEST REPORT ==================
// ==  (Super Admin ONLY — summary + PDF export, no tables on screen)
// ================================================================
const ProductInventoryReport = () => {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentUsage, setDepartmentUsage] = useState({});

  // Period filter
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [quarterFilter, setQuarterFilter] = useState('ALL');

  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const REFRESH_INTERVAL = 15000;

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const [productRes, requestRes] = await Promise.all([
        fetch(PRODUCTS_ENDPOINT),
        fetch(REQUESTS_ENDPOINT),
      ]);

      if (!productRes.ok || !requestRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const productsData = await productRes.json();
      const requestsData = await requestRes.json();

      setRequests(requestsData);

      const requestMap = new Map();
      requestsData.forEach(req => {
        if (req.product && req.product.productId) {
          requestMap.set(req.product.productId, req);
        }
      });

      const mergedData = productsData.map(prod => {
        const req = requestMap.get(prod.productId);
        const requestStatus = req?.status ?? 'AVAILABLE';

        const stockStatus =
          requestStatus === 'APPROVED'
            ? 'Out of Stock'
            : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

        return {
          ...prod,
          quantity: req?.quantity ?? '-',
          adminNote: req?.adminNote ?? '-',
          description: req?.description ?? '-',
          status: requestStatus,
          departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
          productDescription: prod.productDescription ?? '-',
          stockStatus,
          requestedProductName: req?.product?.productName ?? '-',
        };
      });

      setProducts(mergedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (!silent) setError('Failed to load data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getQuarter = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor(d.getMonth() / 3) + 1;
  };
  const getYear = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.getFullYear();
  };
  const getFilterDate = (item) => item.receiptDate || item.issueDate || null;

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  const matchesPeriod = (item) => {
    const d = getFilterDate(item);
    if (!d) return yearFilter === 'ALL' && quarterFilter === 'ALL';
    if (yearFilter !== 'ALL' && getYear(d) !== Number(yearFilter)) return false;
    if (quarterFilter !== 'ALL' && getQuarter(d) !== Number(quarterFilter)) return false;
    return true;
  };

  const periodProducts = useMemo(
    () => products.filter(matchesPeriod),
    [products, yearFilter, quarterFilter]
  );

  const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
  const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

  // Build department usage (for PDF only — not shown on screen)
  useEffect(() => {
    const deptDetails = {};
    requests.forEach(req => {
      if (req.status !== 'APPROVED' && req.status !== 'REJECTED') return;
      const linkedProduct = products.find(p => p.productId === req?.product?.productId);
      const dateStr =
        req.receiptDate ||
        req.issueDate ||
        linkedProduct?.receiptDate ||
        linkedProduct?.issueDate;

      const y = getYear(dateStr);
      const q = getQuarter(dateStr);

      if (yearFilter !== 'ALL' && y !== Number(yearFilter)) return;
      if (quarterFilter !== 'ALL' && q !== Number(quarterFilter)) return;

      const dept = req.departmentName || 'Unknown';
      const productName = req?.product?.productName ?? '-';
      const qty = Number(req.quantity) || 0;
      if (!deptDetails[dept]) deptDetails[dept] = [];
      deptDetails[dept].push({ productName, qty, status: req.status });
    });
    setDepartmentUsage(deptDetails);
  }, [requests, products, yearFilter, quarterFilter]);

  // ============ PDF EXPORT ============
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 40;
    const marginRight = 40;
    const tableWidth = pageWidth - marginLeft - marginRight;

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Product Inventory & Request Report', marginLeft, 40);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

    const periodText =
      yearFilter === 'ALL' && quarterFilter === 'ALL'
        ? 'All Time'
        : `${yearFilter === 'ALL' ? 'All Years' : yearFilter} — ${
            quarterFilter === 'ALL' ? 'All Quarters' : `Q${quarterFilter}`
          }`;
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Period: ${periodText}`, marginLeft, 70);
    doc.setFont('helvetica', 'normal');

    let y = 84;

    const cardY = y + 4;
    const cardHeight = 34;
    const cardGap = 10;
    const cardWidth = (tableWidth - cardGap * 2) / 3;

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.text('In Stock', marginLeft + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    doc.setFillColor(254, 226, 226);
    doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(9);
    doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    doc.setFillColor(219, 234, 254);
    doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(periodProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    y = cardY + cardHeight + 20;

    // Department-wise Usage (PDF only)
    const deptKeys = Object.keys(departmentUsage);
    if (deptKeys.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('Department-wise Usage (Approved / Rejected)', marginLeft, y);
      doc.setFont('helvetica', 'normal');
      y += 10;

      const body = [];
      deptKeys.forEach(dept => {
        const items = departmentUsage[dept];
        const approvedCount = items.filter(i => i.status === 'APPROVED').length;
        const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

        body.push([
          {
            content: dept,
            rowSpan: items.length + 1,
            styles: {
              valign: 'middle', halign: 'left', fontStyle: 'bold',
              textColor: [15, 23, 42], fillColor: [241, 245, 249]
            }
          },
          { content: `Total Requests: ${items.length}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [30, 64, 175], fillColor: [219, 234, 254] } },
          { content: `Approved: ${approvedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [22, 101, 52], fillColor: [220, 252, 231] } },
          { content: `Rejected: ${rejectedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }
        ]);

        items.forEach(item => {
          body.push([
            { content: item.productName, styles: { halign: 'left' } },
            { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
            {
              content: item.status,
              styles: {
                halign: 'center', fontStyle: 'bold',
                textColor: item.status === 'APPROVED' ? [22, 101, 52] : [185, 28, 28],
                fillColor: item.status === 'APPROVED' ? [240, 253, 244] : [254, 242, 242]
              }
            }
          ]);
        });
      });

      autoTable(doc, {
        startY: y + 4,
        head: [['Department', 'Product Name', 'Quantity', 'Status']],
        body,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, overflow: 'linebreak', valign: 'middle', lineColor: [203, 213, 225], lineWidth: 0.5, textColor: [30, 41, 59] },
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
        bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
        tableWidth: tableWidth,
        columnStyles: {
          0: { cellWidth: 160, halign: 'left' },
          1: { cellWidth: 'auto', halign: 'left' },
          2: { cellWidth: 100, halign: 'center' },
          3: { cellWidth: 100, halign: 'center' }
        },
        margin: { left: marginLeft, right: marginRight }
      });

      y = doc.lastAutoTable.finalY + 24;
    }

    // Product Details (PDF only)
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Details', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    y += 10;

    autoTable(doc, {
      startY: y + 4,
      tableWidth: tableWidth,
      theme: 'grid',
      head: [[
        'Product Name', 'Description', 'Qty', 'Department', 'Price',
        'Receipt Date', 'Issue Date', 'Staff Description', 'Admin Note',
        'Admin Status', 'Stock Status'
      ]],
      body: periodProducts.map(p => [
        p.productName ?? '-',
        p.productDescription ?? '-',
        { content: p.quantity ?? '-', styles: { halign: 'center' } },
        p.departmentName ?? '-',
        { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
        { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
        { content: p.issueDate ?? '-', styles: { halign: 'center' } },
        p.description ?? '-',
        p.adminNote ?? '-',
        p.status ?? '-',
        p.stockStatus ?? '-'
      ]),
      styles: { fontSize: 8, cellPadding: { top: 5, right: 6, bottom: 5, left: 6 }, overflow: 'linebreak', valign: 'middle', lineColor: [226, 232, 240], lineWidth: 0.5, textColor: [30, 41, 59] },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', halign: 'center', valign: 'middle', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 75, halign: 'left', fontStyle: 'bold' },
        1: { cellWidth: 105, halign: 'left' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 75, halign: 'left' },
        4: { cellWidth: 50, halign: 'right' },
        5: { cellWidth: 65, halign: 'center' },
        6: { cellWidth: 65, halign: 'center' },
        7: { cellWidth: 95, halign: 'left' },
        8: { cellWidth: 95, halign: 'left' },
        9: { cellWidth: 70, halign: 'center' },
        10: { cellWidth: 60, halign: 'center' }
      },
      margin: { left: marginLeft, right: marginRight },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 9) {
            const v = data.cell.raw;
            if (v === 'APPROVED') { data.cell.styles.textColor = [22, 101, 52]; data.cell.styles.fillColor = [240, 253, 244]; data.cell.styles.fontStyle = 'bold'; }
            else if (v === 'REJECTED') { data.cell.styles.textColor = [185, 28, 28]; data.cell.styles.fillColor = [254, 242, 242]; data.cell.styles.fontStyle = 'bold'; }
            else if (v === 'PENDING') { data.cell.styles.textColor = [146, 64, 14]; data.cell.styles.fillColor = [255, 251, 235]; data.cell.styles.fontStyle = 'bold'; }
          }
          if (data.column.index === 10) {
            const v = data.cell.raw;
            if (v === 'In Stock') { data.cell.styles.textColor = [22, 101, 52]; data.cell.styles.fontStyle = 'bold'; }
            else if (v === 'Out of Stock') { data.cell.styles.textColor = [185, 28, 28]; data.cell.styles.fontStyle = 'bold'; }
          }
        }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text(`Product Inventory & Request Report — ${periodText}`, marginLeft, pageHeight - 20);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
    }

    const periodTag =
      (yearFilter === 'ALL' ? 'AllYears' : yearFilter) + '_' +
      (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter);
    doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
        <button
          onClick={exportToPDF}
          style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          Export to PDF
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          Auto-refresh (15s)
        </label>

        {lastUpdated && (
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Period filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>Report Period:</strong>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Quarters</option>
          <option value="1">Q1 (Jan – Mar)</option>
          <option value="2">Q2 (Apr – Jun)</option>
          <option value="3">Q3 (Jul – Sep)</option>
          <option value="4">Q4 (Oct – Dec)</option>
        </select>
        <button
          onClick={() => { setYearFilter(String(new Date().getFullYear())); setQuarterFilter('ALL'); }}
          style={{ padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          This Year
        </button>
      </div>

      {/* Summary cards only */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
            <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
            <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
          </div>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
            <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
            <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
          </div>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
            <h3 style={{ margin: 0, color: '#1e40af' }}>Total Rows</h3>
            <p style={{ fontSize: '24px', margin: '10px 0', color: '#1e40af' }}>{periodProducts.length}</p>
          </div>
        </div>
      )}

      {/* ❌ No department usage table and no product table on screen for Super Admin.
          Both tables are included in the exported PDF. */}
    </div>
  );
};

// ================================================================
// ==================== SUPER ADMIN DASHBOARD =====================
// ================================================================
const SuperAdminDashboard = () => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportKind, setReportKind] = useState('products');

  const [showInventoryReport, setShowInventoryReport] = useState(false);

  const generateProductsPdf = (products) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('All Products Report', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Unit Price', dataKey: 'unitPrice' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Receipt Date', dataKey: 'receiptDate' },
      { header: 'Issue Date', dataKey: 'issueDate' },
    ];
    const rows = products.map((p) => ({
      id: p.productId ?? '', name: p.productName ?? '', description: p.productDescription ?? '',
      quantity: p.productQuantity ?? '', unitPrice: p.price ?? '', supplier: p.supplierName ?? '',
      receiptDate: p.receiptDate ?? '', issueDate: p.issueDate ?? '',
    }));

    autoTable(doc, {
      columns, body: rows, startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
    });
    doc.save(`products-report-${Date.now()}.pdf`);
  };

  const generateProductsExcel = (products) => {
    const data = products.map((p) => ({
      ID: p.productId ?? '', Name: p.productName ?? '', Description: p.productDescription ?? '',
      Quantity: p.productQuantity ?? '', 'Unit Price': p.price ?? '', Supplier: p.supplierName ?? '',
      'Receipt Date': p.receiptDate ?? '', 'Issue Date': p.issueDate ?? '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
  };

  const generateUsersPdf = (userList) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('System Users Report', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Username', dataKey: 'username' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Gender', dataKey: 'gender' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Role', dataKey: 'role' },
      { header: 'Department', dataKey: 'department' },
    ];
    const rows = userList.map((u) => ({
      id: u.userId ?? u.id ?? '', username: u.userName ?? u.username ?? u.name ?? '',
      email: u.email ?? '', gender: u.gender ?? '', phone: u.phoneNumber ?? u.phone ?? '',
      role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
      department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
    }));

    autoTable(doc, {
      columns, body: rows, startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      margin: { left: 10, right: 10 },
    });
    doc.save(`users-report-${Date.now()}.pdf`);
  };

  const generateUsersExcel = (userList) => {
    const data = userList.map((u) => ({
      ID: u.userId ?? u.id ?? '', Username: u.userName ?? u.username ?? u.name ?? '',
      Email: u.email ?? '', Gender: u.gender ?? '', Phone: u.phoneNumber ?? u.phone ?? '',
      Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
      Department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
  };

  const handleDownloadReport = async (type) => {
    setDownloadingType(type);
    setReportError('');
    try {
      const isUsers = reportKind === 'users';
      const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
      const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } });

      if (!response.ok) {
        let errorMsg = `Server responded with ${response.status}`;
        try { const errText = await response.text(); if (errText) errorMsg = errText; } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('No data available to export.');

      if (isUsers) {
        if (type === 'pdf') generateUsersPdf(data); else generateUsersExcel(data);
      } else {
        if (type === 'pdf') generateProductsPdf(data); else generateProductsExcel(data);
      }
      setShowReportOptions(false);
    } catch (error) {
      console.error('Error downloading report:', error);
      setReportError(
        error.message === 'Failed to fetch'
          ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
          : error.message
      );
    } finally {
      setDownloadingType(null);
    }
  };

  const cards = [
    {
      title: 'All Products Report',
      icon: '📦',
      description: 'Download a full report of all registered products.',
      color: '#3b82f6',
      actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
    },
    {
      title: 'System Users',
      icon: '👥',
      description: 'Download a report of all registered users across every department.',
      color: '#8b5cf6',
      actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
    },
    {
      title: 'Product Inventory & Request Report',
      icon: '📊',
      description: 'Pick a period and export the full inventory PDF report.',
      color: '#0ea5e9',
      actions: [{ label: 'Open Inventory Report', type: 'inventory' }],
    },
  ];

  const handleAction = (action) => {
    if (action.type === 'report') {
      setReportError('');
      setReportKind(action.kind || 'products');
      setShowReportOptions(true);
    } else if (action.type === 'inventory') {
      setShowInventoryReport(true);
    } else if (action.path) {
      window.location.href = action.path;
    }
  };

  const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };
  const modalContent = {
    backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
    maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  };
  const closeButton = {
    marginTop: '20px', padding: '10px 24px', border: 'none', borderRadius: '7px',
    backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  };

  const isUsersReport = reportKind === 'users';
  const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
  const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

  return (
    <div style={{ padding: '30px' }}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
        Welcome, Super Admin — Full System Control
      </p>

      {/* Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
              border: '1px solid #e2e8f0', borderLeft: `5px solid ${card.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
          >
            <div style={{ width: '55px', height: '55px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '18px' }}>
              {card.icon}
            </div>
            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>{card.title}</h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {card.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action)}
                  style={{ width: '100%', padding: '11px 15px', border: 'none', borderRadius: '7px', backgroundColor: card.color, color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {action.label} →
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ============ EMBEDDED INVENTORY REPORT (SUMMARY + PDF ONLY) ============ */}
      {showInventoryReport && (
        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Product Inventory & Request Report</h2>
            <button
              onClick={() => setShowInventoryReport(false)}
              style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              Close ✕
            </button>
          </div>
          <ProductInventoryReport />
        </div>
      )}

      {/* ============ REPORT OPTIONS MODAL ============ */}
      {showReportOptions && (
        <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose the format you want to download:</p>

            {reportError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {reportError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingType === 'pdf'}
                style={{
                  flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
                  background: downloadingType === 'pdf' ? '#f87171' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
                {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
              </button>

              <button
                onClick={() => handleDownloadReport('excel')}
                disabled={downloadingType === 'excel'}
                style={{
                  flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
                  background: downloadingType === 'excel' ? '#4ade80' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
                {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
              </button>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }} onClick={() => setShowReportOptions(false)} disabled={!!downloadingType}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Shared styles
const selectStyle = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' };

export default SuperAdminDashboard;