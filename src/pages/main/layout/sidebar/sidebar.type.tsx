export type TmenuTypes = {
	menus: {
		name: string;
		rawName: string;
		items: [];
	}[];
}

export type TmenuItems = {
	name: string;
	rawName: string;
	items: [];
}

export type TmenuListTypes = {
	type: string;
	name: string;
	url: string;
	itemid: number;
	menid: number;
	modid: number;
	value: string;
}

export type TIconbar = {
	name: string;
	label: string;
};

export type TMenuProps = {
    menuItems: object[];
};

export type TMenuItemTypes = {
	iconCss: string;
	menuName: string;
	items: [];
}

export type TFavoritesTypes = {
	index: number;
	itemid: number;
	menid: number;
	modid: number;
	name: string;	
}