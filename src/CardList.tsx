import React, { FunctionComponent } from 'react'
import { Card } from './atoms/Card'

// wrap each child in a card

interface CardListProps {}

export const CardList: FunctionComponent<CardListProps> = ({ children }) => {
    return (
      <div style={{ 
        width: 'calc(100% - 20px)', 
        maxWidth: '400px', 
        marginLeft: '10px', 
        marginRight: '10px', 
        blockSize: 'border-block', 
        margin: '0 auto'
      }}>
        {React.Children.map(children, child => <Card>{child}</Card>)}
      </div>
    )
}