import { useRouter } from 'next/router';
import { NavLink, Center, ActionIcon, Divider } from '@mantine/core';

import { IconHome2, IconArrowBackUp, IconApps, IconVocabulary, IconServer, IconDatabasePlus, IconTrowel, IconRowInsertTop, IconDevicesPc, IconAlien } from '@tabler/icons-react';

interface NavItem {
    name?: string,
    path: string,
    type?: string,
    icon?: JSX.Element,
    subNav?: NavItem[],
    parentPath?: string,
    level?: number,
    solo?: boolean
}





const flattenNavItems = (result: { [key: string]: NavItem }, navItems: NavItem[], parentPath = '', level = 0) => {
    level++;
    return navItems.reduce((result, item) => {
        const fullPath = item.path;
        item.parentPath = parentPath;
        item.level = level;
        result[fullPath] = item;
        if (item.subNav) {
            result = flattenNavItems(result, item.subNav, `${fullPath}`, level);
        } else {
            result[fullPath] = item;
        }
        return result;
    }, result);
};

export const Nav = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const id: any = query.id;
    const taskId: any = query.taskId;

    const handleClick = (path: string) => {
        router.push(`${path.replace('[id]', id).replace('[taskId]', taskId)}`)
    };
    const navItems: NavItem[] = [
        {
            name: "微信小助手",
            path: "/overview",
            icon: <IconHome2 size="1rem" stroke={1.5} />,
        },
       
    ]

    const navItemsMap = flattenNavItems({}, navItems);

    const currentNav: NavItem = navItemsMap[pathname] || {};
    let renderNavList: NavItem[] = [];
    if (currentNav.solo) {
        renderNavList = [currentNav]; // 只有一个
    } else {
        renderNavList = Object.keys(navItemsMap).filter((key) => {
            const navItem = navItemsMap[key];
            return navItem.level === currentNav.level && navItem.parentPath === currentNav.parentPath;
        }).map((key) => {
            return navItemsMap[key];
        })
    }


    return (
        <>
            {currentNav.parentPath ?
                <Center h={40} mx="auto">
                    <ActionIcon onClick={() => {
                        let parentPath = currentNav.parentPath?.replace('[id]', id).replace('[taskId]', taskId) || '';
                        router.push(parentPath)
                    }}>
                        <IconArrowBackUp />
                    </ActionIcon>
                </Center> : null}
            {renderNavList.map((item: NavItem) => {
                if (item.type === 'divider') {
                    return <Divider mt={8} mb={8} key={item.path} />
                } else {
                    return <NavLink key={item.path}
                        label={item.name}
                        leftSection={item.icon}
                        variant="filled"
                        onClick={() => handleClick(item.path)}
                        active={pathname === item.path ? true : false} />
                }
            })}

        </>
    )
}