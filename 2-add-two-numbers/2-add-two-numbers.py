# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        final = ListNode()
        head = final
        total = 0
        while(l1 or l2):
            total += l1.val if l1 else 0
            total += l2.val if l2 else 0
            final.val = total % 10
            if total >= 10:
                total = 1 # carry
            else:
                total = 0
            
            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next

            final.next = ListNode()
            last = final
            final = final.next
            
        if total:
            final.val = 1
        else:
            last.next = None
        return head
                
