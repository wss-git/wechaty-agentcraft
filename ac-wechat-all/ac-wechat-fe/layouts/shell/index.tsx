import { useRouter } from 'next/router';
import { AppShell } from '@mantine/core';
// import { Nav } from 'layouts/navbar'
// import { Header } from 'layouts/header'
import React from "react";


export function Shell(props: any) {
    return <AppShell
        // header={{ height: 60 }}
        // navbar={{ width: 240, breakpoint: 'sm' }}
        padding="md"
    >
        {/* <AppShell.Header>
        <Header />
    </AppShell.Header> */}
        {/* <AppShell.Navbar p="md">
        <Nav />
    </AppShell.Navbar> */}

        <AppShell.Main>{props.children}</AppShell.Main>
    </AppShell>

}