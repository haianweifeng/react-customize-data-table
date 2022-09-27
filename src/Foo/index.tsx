import React from 'react';
import styles from './index.less';

export default ({ title }: { title: string }) => <h1 className={styles.container}>{title}</h1>;
