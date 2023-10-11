export type EmployeeData = {
	loginName: string;
	gamesite: {
		name: string
	}
	// Other properties of the employee data
};

export type RootState = {
	employeeAction: {
		data: EmployeeData | null;
	};
};

export type LayoutComponentProps = {
	children: React.ReactNode;
};
