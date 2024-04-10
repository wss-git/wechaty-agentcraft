import { useEffect } from 'react';
import { Box, Flex } from '@mantine/core';
import { IconBrandGithubFilled } from '@tabler/icons-react';

import { useRouter } from 'next/router';
import styles from '@/styles/header.module.scss';
export function Header() {
    const router = useRouter();

    useEffect(() => {

    }, []);
    return <div className={styles['aigc-header']} >
        <Box ml={5}>
            <a href="https://github.com/devsapp/agentcraft" target="_blank">
                <Flex align="center">
                    <span style={{ marginRight: 12 }}>AIGC</span>  <IconBrandGithubFilled color='white' />
                </Flex>
            </a>
        </Box>
    </div>

}