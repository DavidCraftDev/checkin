export function GetSortOrderByName(prop: any) {
    return function (a: any, b: any) {
        if (a[prop].name > b[prop].name) {
            return 1;
        } else if (a[prop].name < b[prop].name) {
            return -1;
        }
        return 0;
    }
}

export function GetSortOrderByCreatedAt(prop: any) {
    return function (a: any, b: any) {
        if (a[prop].created_at > b[prop].created_at) {
            return 1;
        } else if (a[prop].created_at < b[prop].created_at) {
            return -1;
        }
        return 0;
    }
}    
