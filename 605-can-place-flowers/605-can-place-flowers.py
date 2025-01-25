class Solution:
    def canPlaceFlowers(self, flowerbed: List[int], n: int) -> bool:
        ind = 0
        count = 0
        new_f = [0] + flowerbed + [0]

        while ind < len(new_f) - 2:

            if new_f[ind] == 0 and new_f[ind+1] == 0 and new_f[ind+2] == 0:
                count += 1
                ind += 2
            else:
                ind += 1
        
        if count >= n:
            return True
        return False