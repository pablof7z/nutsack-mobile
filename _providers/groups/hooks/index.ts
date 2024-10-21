import { useContext } from 'react'
import { GroupContext } from '../context'

export const useGroups = () => {
    const context = useContext(GroupContext)
    if (context === undefined) {
        throw new Error('useGroups must be used within a GroupsProvider')
    }
    return context
}
