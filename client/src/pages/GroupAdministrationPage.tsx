import { useParams } from 'react-router-dom'
import { GroupAdministration } from '../components/GroupAdministration/GroupAdministration'

export const GroupAdministrationPage = () => {
  const { groupId } = useParams<{ groupId: string }>()

  return (
    <>
      {groupId && <GroupAdministration groupId={groupId} />}
    </>
  )
}
