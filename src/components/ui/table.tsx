import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  ...props
}) => <table {...props}>{children}</table>;

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  ...props
}) => <tbody {...props}>{children}</tbody>;

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  ...props
}) => <td {...props}>{children}</td>;

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  ...props
}) => <th {...props}>{children}</th>;

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  ...props
}) => <thead {...props}>{children}</thead>;

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  key?: React.Key;
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  ...props
}) => <tr {...props}>{children}</tr>;
export default Table;
