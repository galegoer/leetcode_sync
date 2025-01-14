class Solution:
    # class Node:
    #     def __init__(self, data):
    #         self.children = []
    #         self.value = data
    #     def add_child(self, obj):
    #         self.children.append(obj)
    
    def lexicalOrder(self, n: int) -> List[int]:
        final = []
        counter = 1

        if n == 0:
            return []
        final = []
        curr = 1

        for i in range(n):
            final.append(curr)
            if(curr*10<=n):
                curr = curr*10
            else:
                while(curr%10==9 or curr>=n):
                    curr = curr//10
                curr += 1
        return final
            